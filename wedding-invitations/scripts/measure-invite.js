const puppeteer = require("puppeteer-core");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: "new", args: ["--no-sandbox","--disable-gpu"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 480, height: 900 });
  await page.goto("http://localhost:3000/invite/31c3556673ccac5e98a6e95837fa39d7363af27555e8d7b0", { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise(r=>setTimeout(r,2000));
  const rows = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("div")) {
      const t = (el.textContent||"").trim();
      if (t === "Ana" || t === "Zlatan" || t === "14:00" || t === "Praia do Bilene") {
        const fs = parseFloat(getComputedStyle(el).fontSize);
        out.push({ t, fontSize: Math.round(fs*10)/10 });
      }
    }
    return out;
  });
  console.log(JSON.stringify(rows, null, 2));
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
