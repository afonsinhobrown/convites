const puppeteer = require("puppeteer-core");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://localhost:3000";
const OUT = process.env.TEMP + "\\opencode";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 1000, deviceScaleFactor: 1 });

  // 1) Login designer (usa fluxo superadmin)
  const loginRes = await page.goto(`${BASE}/designer/login`, { waitUntil: "networkidle0", timeout: 60000 });
  console.log("login page:", loginRes.status());
  await new Promise(r=>setTimeout(r,));
  await page.type('#password', "688623d0c60d4fc199967886d5ee3cb185edf9a023b245a0b0e128c656574c13", { delay: 10 });
  await page.evaluate(() => {
    const b = document.querySelector('button[type="submit"]');
    if (b) b.click();
  });
  await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 30000 }).catch(() => {});
  await new Promise(r=>setTimeout(r,));
  console.log("after login URL:", page.url());

  // 2) Abrir editor magnolia-classica
  await page.goto(`${BASE}/designer/editor/magnolia-classica`, { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise(r=>setTimeout(r,));
  await page.screenshot({ path: `${OUT}\\editor-inicial.png` });
  console.log("editor load url:", page.url());

  // Ver posição do brideName antes
  const before = await page.evaluate(() => {
    const label = [...document.querySelectorAll("div")].find((el) => el.textContent === "Noiva: Ana");
    if (!label) return null;
    const parent = label.closest(".react-draggable") || label.parentElement;
    const rect = parent.getBoundingClientRect();
    return { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width) };
  });
  console.log("brideName antes:", JSON.stringify(before));

  // 3) Arrastar brideName — mover 200px à direita
  await page.evaluate(() => {
    const label = [...document.querySelectorAll("div")].find((el) => el.textContent === "Noiva: Ana");
    const draggable = label.closest(".react-draggable");
    if (draggable) draggable.setAttribute("data-target", "true");
  });
  const box = await page.evaluate(() => {
    const el = document.querySelector('[data-target="true"]');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  console.log("brideName centre:", JSON.stringify(box));
  if (box) {
    await page.mouse.move(box.x, box.y);
    await page.mouse.down();
    await page.mouse.move(box.x + 150, box.y + 60, { steps: 15 });
    await page.mouse.up();
    await new Promise(r=>setTimeout(r,));
  }
  await page.screenshot({ path: `${OUT}\\editor-arastado.png` });

  const afterDrag = await page.evaluate(() => {
    const label = [...document.querySelectorAll("div")].find((el) => el.textContent === "Noiva: Ana");
    const parent = label.closest(".react-draggable") || label.parentElement;
    const rect = parent.getBoundingClientRect();
    return { x: Math.round(rect.x), y: Math.round(rect.y) };
  });
  console.log("brideName depois drag:", JSON.stringify(afterDrag));

  // 4) Guardar
  await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("Guardar"));
    if (btn) btn.click();
  });
  await new Promise(r=>setTimeout(r,));
  const savedText = await page.evaluate(() => document.body.textContent.includes("Guardado"));
  console.log("guardado:", savedText);

  // 5) Verificar API na BD (layoutJson do brideName mudou?)
  await page.goto(`${BASE}/api/designer/templates/magnolia-classica`, { waitUntil: "networkidle0" }).catch(() => {});
  // GET não existe; vamos verificar via pagina editor reload
  await page.goto(`${BASE}/designer/editor/magnolia-classica`, { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise(r=>setTimeout(r,));
  const afterReload = await page.evaluate(() => {
    const label = [...document.querySelectorAll("div")].find((el) => el.textContent === "Noiva: Ana");
    const parent = label.closest(".react-draggable") || label.parentElement;
    const rect = parent.getBoundingClientRect();
    return { x: Math.round(rect.x), y: Math.round(rect.y) };
  });
  console.log("brideName após reload:", JSON.stringify(afterReload));
  await page.screenshot({ path: `${OUT}\\editor-persistencia.png` });

  await browser.close();
})().catch((e) => {
  console.error("ERRO:", e.message);
  process.exit(1);
});