import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html", host: "localhost" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Planet Eating landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="de">/i);
  assert.match(html, /<title>Planet Eating/);
  assert.match(html, /Eine Welt\./);
  assert.match(html, /Zehn Teams\./);
  assert.match(html, /KONTO ÖFFNEN/);
  assert.match(html, /NEUES KONTO ERSTELLEN/);
  assert.match(html, /Deine ID bleibt geheim/);
  assert.match(html, /WINDOWS-DOWNLOAD/);
  assert.match(html, /href="\/api\/release"/);
  assert.match(html, /http:\/\/localhost\/og\.png/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("removes the temporary starter preview", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /PLANET EATING/);
  assert.match(layout, /generateMetadata/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
  await access(new URL("../public/og.png", import.meta.url));
  await access(new URL(".openai/hosting.json", templateRoot));
  await access(new URL("../app/api/account/route.ts", import.meta.url));
  await access(new URL("../.env.example", import.meta.url));
});

test("rejects an incomplete game ID before contacting Supabase", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("account-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/api/account", {
      method: "POST",
      headers: { "content-type": "application/json", host: "localhost" },
      body: JSON.stringify({ action: "load", gameId: "zu-kurz" }),
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );

  assert.equal(response.status, 400);
  assert.match(JSON.stringify(await response.json()), /nicht vollständig/);
});
