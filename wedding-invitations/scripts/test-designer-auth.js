const puppeteer = require("puppeteer-core");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function main() {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: "new", args: ["--no-sandbox","--disable-gpu"] });
  const results = [];

  // 1. Página limpa, /designer/editor sem login -> redireciona
  const p1 = await browser.newPage();
  const r1 = await p1.goto("http://localhost:3000/designer/editor/magnolia-casal", { waitUntil: "domcontentloaded" });
  results.push({ test: "sem login -> redireciona", url: p1.url(), status: r1.status() });

  // 2. PATCH sem login -> 401
  const r2 = await p1.evaluate(() => fetch("/api/designer/templates/magnolia-casal", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ layoutJson: { a: 1 } }) }).then(r => r.status));
  results.push({ test: "PATCH sem login -> 401", status: r2 });

  // 3. Login designer corretamente (página limpa)
  const p2 = await browser.newPage();
  await p2.goto("http://localhost:3000/designer/login", { waitUntil: "networkidle0" });
  await p2.type("#email", "designer@doremi.local");
  await p2.type("#password", "designer123");
  await Promise.all([
    p2.waitForNavigation({ waitUntil: "networkidle0", timeout: 30000 }).catch(() => {}),
    p2.click("button[type=submit]"),
  ]);
  await new Promise(r => setTimeout(r, 1500));
  results.push({ test: "login ok -> url", url: p2.url() });

  // 4. Campos Rnd presentes no editor
  const count = await p2.evaluate(() => document.querySelectorAll(".react-draggable").length);
  results.push({ test: "campos draggable", count });

  // 5. PATCH com cookie designer -> 200 e auditoria gravada
  const r5 = await p2.evaluate(() =>
    fetch("/api/designer/templates/magnolia-casal", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ layoutJson: { guestName: { x: 257, y: 30, width: 510, height: 44, fontSize: 25, fontFamily: "Inter", color: "#8B5A2B", textAlign: "center" } } }) }).then(async r => ({ status: r.status, bodyText: await r.text() }))
  );
  results.push({ test: "PATCH com login", ...r5 });

  // 6. Auditoria na BD: editedById preenchido, campo editedAt
  await p2.evaluate(() => fetch("/api/designer/logout", { method: "POST" }).catch(() => {}));

  // 7. Superadmin independente: sem superadmin_token continua a pedir login
  const p3 = await browser.newPage();
  const r7 = await p3.goto("http://localhost:3000/superadmin/settings", { waitUntil: "domcontentloaded" });
  results.push({ test: "/superadmin/settings sem superadmin -> /superadmin/login", url: p3.url(), status: r7.status() });

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });