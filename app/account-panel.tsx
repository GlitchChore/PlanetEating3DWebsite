"use client";

import { useState } from "react";

type Settings = {
  resolution: number;
  fullscreen: boolean;
  quality: number;
  view_distance: number;
  sensitivity: number;
  volume: number;
  music_volume: number;
  sfx_volume: number;
};

type Round = {
  zone: number;
  team_id: number;
  result: string;
  play_seconds: number;
  buildings: number;
  is_online: boolean;
  started_at: string;
};

type Account = {
  name: string;
  lastSeen: string;
  settings: Settings;
  rounds: Round[];
};

const emptySettings: Settings = {
  resolution: 0,
  fullscreen: true,
  quality: 2,
  view_distance: 2,
  sensitivity: 5,
  volume: 10,
  music_volume: 8,
  sfx_volume: 10,
};

async function accountRequest(body: Record<string, unknown>) {
  const response = await fetch("/api/account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error ?? "Die Anfrage ist fehlgeschlagen.");
  }
  return result;
}

function rangeLabel(value: number) {
  return `${value * 10}%`;
}

export default function AccountPanel() {
  const [gameId, setGameId] = useState("");
  const [name, setName] = useState("");
  const [account, setAccount] = useState<Account | null>(null);
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [createdId, setCreatedId] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [showId, setShowId] = useState(false);

  async function load() {
    setBusy(true);
    setMessage("");
    try {
      const result = await accountRequest({ action: "load", gameId });
      setAccount(result.account);
      setName(result.account.name);
      setSettings(result.account.settings ?? emptySettings);
      setCreatedId("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Das Konto konnte nicht geladen werden.");
    } finally {
      setBusy(false);
    }
  }

  async function create() {
    setBusy(true);
    setMessage("");
    try {
      const result = await accountRequest({ action: "create", name });
      setGameId(result.gameId);
      setCreatedId(result.gameId);
      setShowId(true);
      setAccount(result.account);
      setSettings(result.account.settings ?? emptySettings);
      setMessage("Dein Konto wurde erstellt. Bewahre die Spiel-ID sicher auf.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Das Konto konnte nicht erstellt werden.");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    setMessage("");
    try {
      const result = await accountRequest({ action: "save", gameId, name, settings });
      setAccount(result.account);
      setMessage("Name und Einstellungen wurden gespeichert.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Die Änderungen konnten nicht gespeichert werden.");
    } finally {
      setBusy(false);
    }
  }

  function signOut() {
    setAccount(null);
    setGameId("");
    setCreatedId("");
    setShowId(false);
    setMessage("");
  }

  function updateSetting<Key extends keyof Settings>(key: Key, value: Settings[Key]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  if (!account) {
    return (
      <div className="account-panel">
        <span className="preview-label">SPIELKONTO</span>
        <label htmlFor="game-id">GEHEIME SPIEL-ID</label>
        <div className="secret-field">
          <input
            id="game-id"
            type={showId ? "text" : "password"}
            value={gameId}
            onChange={(event) => setGameId(event.target.value)}
            placeholder="PE3D-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" onClick={() => setShowId((value) => !value)}>{showId ? "Verbergen" : "Zeigen"}</button>
        </div>
        <button className="account-primary" type="button" disabled={busy} onClick={load}>
          {busy ? "BITTE WARTEN …" : "KONTO ÖFFNEN"}
        </button>
        <div className="account-divider"><span>oder neu beginnen</span></div>
        <label htmlFor="new-player-name">SPIELERNAME</label>
        <input id="new-player-name" value={name} maxLength={24} onChange={(event) => setName(event.target.value)} placeholder="Dein Name" />
        <button className="account-secondary" type="button" disabled={busy} onClick={create}>NEUES KONTO ERSTELLEN</button>
        {message && <p className="form-message" role="status">{message}</p>}
        <small>Die Spiel-ID ist dein Schlüssel. Teile sie niemals öffentlich.</small>
      </div>
    );
  }

  return (
    <div className="account-panel account-ready">
      <div className="account-title-row">
        <div><span className="preview-label">ANGEMELDET</span><h3>{account.name}</h3></div>
        <button className="text-button" type="button" onClick={signOut}>Abmelden</button>
      </div>

      {createdId && (
        <div className="created-secret">
          <strong>Deine neue Spiel-ID</strong>
          <code>{showId ? createdId : "PE3D-•••••-•••••-•••••-•••••-•••••"}</code>
          <div>
            <button type="button" onClick={() => setShowId((value) => !value)}>{showId ? "Verbergen" : "Zeigen"}</button>
            <button type="button" onClick={() => navigator.clipboard.writeText(createdId)}>ID kopieren</button>
          </div>
        </div>
      )}

      <label htmlFor="profile-name">SPIELERNAME</label>
      <input id="profile-name" value={name} maxLength={24} onChange={(event) => setName(event.target.value)} />

      <div className="settings-grid">
        <label>Grafik<select value={settings.quality} onChange={(event) => updateSetting("quality", Number(event.target.value))}><option value={0}>Sehr niedrig</option><option value={1}>Niedrig</option><option value={2}>Mittel</option><option value={3}>Hoch</option><option value={4}>Sehr hoch</option></select></label>
        <label>Sichtweite<select value={settings.view_distance} onChange={(event) => updateSetting("view_distance", Number(event.target.value))}><option value={0}>Kurz</option><option value={1}>Mittel</option><option value={2}>Weit</option><option value={3}>Sehr weit</option></select></label>
        <label className="check-setting"><input type="checkbox" checked={settings.fullscreen} onChange={(event) => updateSetting("fullscreen", event.target.checked)} /> Vollbild</label>
        <label>Maus-Empfindlichkeit <span>{settings.sensitivity}</span><input type="range" min="0" max="10" value={settings.sensitivity} onChange={(event) => updateSetting("sensitivity", Number(event.target.value))} /></label>
        <label>Gesamtlautstärke <span>{rangeLabel(settings.volume)}</span><input type="range" min="0" max="10" value={settings.volume} onChange={(event) => updateSetting("volume", Number(event.target.value))} /></label>
        <label>Musik <span>{rangeLabel(settings.music_volume)}</span><input type="range" min="0" max="10" value={settings.music_volume} onChange={(event) => updateSetting("music_volume", Number(event.target.value))} /></label>
        <label>Geräusche <span>{rangeLabel(settings.sfx_volume)}</span><input type="range" min="0" max="10" value={settings.sfx_volume} onChange={(event) => updateSetting("sfx_volume", Number(event.target.value))} /></label>
      </div>

      <button className="account-primary" type="button" disabled={busy} onClick={save}>{busy ? "SPEICHERT …" : "ÄNDERUNGEN SPEICHERN"}</button>
      {message && <p className="form-message" role="status">{message}</p>}

      <div className="round-list">
        <h4>Letzte Runden</h4>
        {account.rounds.length === 0 ? <p>Noch keine gespeicherten Runden.</p> : account.rounds.map((round, index) => (
          <article key={`${round.started_at}-${index}`}>
            <strong>Zone {round.zone} · Team {round.team_id + 1}</strong>
            <span>{round.is_online ? "Online" : "Allein"} · {Math.floor(round.play_seconds / 60)} Minuten · {round.buildings} Bauwerke</span>
          </article>
        ))}
      </div>
    </div>
  );
}
