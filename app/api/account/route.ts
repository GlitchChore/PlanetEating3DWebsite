import { NextResponse } from "next/server";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const accountSalt = "PlanetEating3D.Account.v2:";

type CloudSettings = {
  resolution: number;
  fullscreen: boolean;
  quality: number;
  view_distance: number;
  sensitivity: number;
  volume: number;
  music_volume: number;
  sfx_volume: number;
};

const defaultSettings: CloudSettings = {
  resolution: 0,
  fullscreen: true,
  quality: 2,
  view_distance: 2,
  sensitivity: 5,
  volume: 10,
  music_volume: 8,
  sfx_volume: 10,
};

function normalizeGameId(value: unknown) {
  const text = typeof value === "string" ? value.toUpperCase().trim() : "";
  const withoutPrefix = text.startsWith("PE3D-") ? text.slice(5) : text;
  return [...withoutPrefix].filter((character) => alphabet.includes(character)).join("");
}

function formatGameId(normalized: string) {
  return `PE3D-${normalized.match(/.{1,5}/g)?.join("-") ?? normalized}`;
}

function createGameId() {
  const bytes = crypto.getRandomValues(new Uint8Array(25));
  const normalized = [...bytes].map((value) => alphabet[value % alphabet.length]).join("");
  return formatGameId(normalized);
}

async function accountId(gameId: string) {
  const normalized = normalizeGameId(gameId).toLowerCase();
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(accountSalt + normalized));
  const hex = [...new Uint8Array(hash)].slice(0, 16).map((value) => value.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function cleanName(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/[\r\n]/g, " ").slice(0, 24) : "";
}

function numberInRange(value: unknown, minimum: number, maximum: number, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(maximum, Math.max(minimum, Math.round(number))) : fallback;
}

function cleanSettings(value: unknown): CloudSettings {
  const input = value && typeof value === "object" ? value as Partial<CloudSettings> : {};
  return {
    resolution: numberInRange(input.resolution, 0, 20, defaultSettings.resolution),
    fullscreen: input.fullscreen !== false,
    quality: numberInRange(input.quality, 0, 10, defaultSettings.quality),
    view_distance: numberInRange(input.view_distance, 0, 10, defaultSettings.view_distance),
    sensitivity: numberInRange(input.sensitivity, 0, 10, defaultSettings.sensitivity),
    volume: numberInRange(input.volume, 0, 10, defaultSettings.volume),
    music_volume: numberInRange(input.music_volume, 0, 10, defaultSettings.music_volume),
    sfx_volume: numberInRange(input.sfx_volume, 0, 10, defaultSettings.sfx_volume),
  };
}

function configuration() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

async function supabaseRequest(path: string, gameId: string, init: RequestInit = {}) {
  const config = configuration();
  if (!config) {
    throw new Error("Die Kontoverbindung ist noch nicht eingerichtet.");
  }

  return fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      "X-Game-Id": gameId,
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
}

async function readJson(response: Response) {
  if (!response.ok) {
    throw new Error("Supabase hat die Anfrage abgelehnt. Bitte versuche es später erneut.");
  }
  return response.json();
}

async function loadAccount(gameId: string) {
  const id = await accountId(gameId);
  const [playerResponse, settingsResponse, roundsResponse] = await Promise.all([
    supabaseRequest(`players?id=eq.${id}&select=name,last_seen&limit=1`, gameId),
    supabaseRequest(`settings?player_id=eq.${id}&select=resolution,fullscreen,quality,view_distance,sensitivity,volume,music_volume,sfx_volume&limit=1`, gameId),
    supabaseRequest(`rounds?player_id=eq.${id}&select=zone,team_id,result,play_seconds,buildings,boss_attempts,is_online,started_at,ended_at&order=started_at.desc&limit=8`, gameId),
  ]);

  const [players, settings, rounds] = await Promise.all([
    readJson(playerResponse),
    readJson(settingsResponse),
    readJson(roundsResponse),
  ]);

  if (!Array.isArray(players) || players.length === 0) {
    return null;
  }

  return {
    name: players[0].name,
    lastSeen: players[0].last_seen,
    settings: Array.isArray(settings) && settings.length > 0 ? settings[0] : defaultSettings,
    rounds: Array.isArray(rounds) ? rounds : [],
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "load";

    if (action === "create") {
      const name = cleanName(body.name);
      if (!name) {
        return NextResponse.json({ error: "Bitte gib zuerst einen Spielernamen ein." }, { status: 400 });
      }

      const gameId = createGameId();
      const id = await accountId(gameId);
      const now = new Date().toISOString();
      const playerResponse = await supabaseRequest("players", gameId, {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({ id, name, last_seen: now }),
      });
      await readJson(playerResponse);

      const settingsResponse = await supabaseRequest("settings", gameId, {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({ player_id: id, ...defaultSettings, updated_at: now }),
      });
      await readJson(settingsResponse);

      return NextResponse.json({ gameId, account: await loadAccount(gameId) });
    }

    const normalized = normalizeGameId(body.gameId);
    if (normalized.length !== 25) {
      return NextResponse.json({ error: "Diese Spiel-ID ist nicht vollständig." }, { status: 400 });
    }

    const gameId = formatGameId(normalized);
    if (action === "save") {
      const name = cleanName(body.name);
      if (!name) {
        return NextResponse.json({ error: "Der Spielername darf nicht leer sein." }, { status: 400 });
      }

      const existing = await loadAccount(gameId);
      if (!existing) {
        return NextResponse.json({ error: "Zu dieser Spiel-ID wurde kein Konto gefunden." }, { status: 404 });
      }

      const id = await accountId(gameId);
      const settings = cleanSettings(body.settings);
      const now = new Date().toISOString();
      const [playerResponse, settingsResponse] = await Promise.all([
        supabaseRequest(`players?id=eq.${id}`, gameId, {
          method: "PATCH",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({ name, last_seen: now }),
        }),
        supabaseRequest("settings", gameId, {
          method: "POST",
          headers: { Prefer: "resolution=merge-duplicates,return=representation" },
          body: JSON.stringify({ player_id: id, ...settings, updated_at: now }),
        }),
      ]);
      await Promise.all([readJson(playerResponse), readJson(settingsResponse)]);
    }

    const account = await loadAccount(gameId);
    if (!account) {
      return NextResponse.json({ error: "Zu dieser Spiel-ID wurde kein Konto gefunden." }, { status: 404 });
    }

    return NextResponse.json({ account });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Das Konto konnte nicht geladen werden.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
