const puppeteer = require("puppeteer-core");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function main() {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: "new", args: ["--no-sandbox","--disable-gpu"] });
  const page = await browser.newPage();
  const results = [];

  // Login como designer
  await page.goto("http://localhost:3000/designer/login", { waitUntil: "networkidle0" });
  await page.type("#email", "designer@doremi.local");
  await page.type("#password", "designer123");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle0", timeout: 30000 }).catch(() => {}),
    page.click("button[type=submit]"),
  ]);
  await new Promise(r => setTimeout(r, 1500));

  // Editor aberto?
  results.push({ test: "editor aberto", url: page.url() });

  // 1. Dropdown com 8 fontes
  const fontCount = await page.evaluate(() => {
    const selects = document.querySelectorAll("select");
    for (const s of selects) {
      if (s.options.length >= 8 && s.options[0].textContent.includes("Playfair")) {
        return s.options.length;
      }
    }
    return -1;
  });
  results.push({ test: "dropdown fontes (>=8)", count: fontCount });

  // 2. Secões no painel (Tipografia, Posição, Alinhamento + Presets + Duplicar)
  const panel = await page.evaluate(() => {
    const txt = document.body.textContent || "";
    return {
      tipografia: txt.includes("Tipografia"),
      posicao: txt.includes("Posição"),
      alinhamento: txt.includes("Alinhamento"),
      presetNome: txt.includes("Estilo de Nome"),
      presetFrase: txt.includes("Estilo de Frase"),
      presetLabel: txt.includes("Estilo de Label"),
      duplicar: txt.includes("Duplicar"),
      reset: txt.includes("Reset"),
      fixar: txt.includes("Fixar"),
      italico: txt.includes("Itálico"),
      letterSpacing: txt.includes("Letter-spacing"),
      lineHeight: txt.includes("Line-height"),
      textTransform: txt.includes("Text-transform"),
    };
  });
  results.push({ test: "painel sections", ...panel });

  // 3. Preview em tempo real: mudar família do Noiva para Great Vibes
  //    Localizar o select de famílias e escolher Great Vibes
  const fontSelect = await page.$$("select");
  let famSelect = null;
  for (const s of fontSelect) {
    const opts = await s.$$eval("option", els => els.map(o => o.value));
    if (opts.length === 8 && opts[0] === "Playfair Display") famSelect = s;
  }
  if (famSelect) {
    await famSelect.select("Great Vibes");
    await new Promise(r => setTimeout(r, 400));
    const brideBox = await page.evaluate(() => {
      const nodes = [...document.querySelectorAll(".react-draggable")];
      for (const n of nodes) {
        if (n.textContent.trim().startsWith("Ana")) {
          return { cls: n.firstElementChild?.className || "", txt: n.textContent.trim() };
        }
      }
      return null;
    });
    results.push({ test: "preview Great Vibes (classe)", bride: brideBox });
  } else {
    results.push({ test: "NAO encontrou select de familias", count: -1 });
  }

  // 4. Valor real (sem label) e se "copias" mostram (cópia)
  const texts = await page.evaluate(() => {
    const out = [];
    for (const n of document.querySelectorAll(".react-draggable")) {
      const t = n.textContent.trim();
      if (t.startsWith("Ana") || t.startsWith("Zlatan") || t.startsWith("Convidado")) out.push(t);
    }
    return out;
  });
  results.push({ test: "textos preview (sem labels extra)", texts });

  // 5. Duplicar e verificar que aparece novo campo
  const before = await page.evaluate(() => document.querySelectorAll(".react-draggable").length);
  const btns = await page.$$("button");
  for (const b of btns) {
    const t = await b.evaluate(el => el.textContent);
    if (t && t.includes("Duplicar")) { await b.click(); break; }
  }
  await new Promise(r => setTimeout(r, 400));
  const after = await page.evaluate(() => document.querySelectorAll(".react-draggable").length);
  results.push({ test: "duplicar campo", before, after });

  // 6. Remover a cópia
  const btns2 = await page.$$("button");
  for (const b of btns2) {
    const t = await b.evaluate(el => el.textContent);
    if (t && t.trim() === "Remover") { await b.click(); break; }
  }
  await new Promise(r => setTimeout(r, 400));
  const afterDel = await page.evaluate(() => document.querySelectorAll(".react-draggable").length);
  results.push({ test: "remover copia", expect: after - 1, after: afterDel });

  // 7. Reset restaura
  const btns3 = await page.$$("button");
  for (const b of btns3) {
    const t = await b.evaluate(el => el.textContent);
    if (t && t.trim() === "Reset") { await b.click(); break; }
  }
  await new Promise(r => setTimeout(r, 400));
  const resetCount = await page.evaluate(() => document.querySelectorAll(".react-draggable").length);
  results.push({ test: "reset", expect: before - 1, resetCount });

  // 8. Guardar sem erros (via API, após reset) — não guardar as alterações de fonte para não poluir
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });