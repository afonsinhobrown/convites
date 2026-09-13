const puppeteer = require("puppeteer-core");
const path = require("path");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BASE = "http://localhost:3000";

(async () => {
  const token = process.argv[2];
  const out = process.argv[3] || path.join(process.env.TEMP || "C:\\Users\\Acer\\AppData\\Local\\Temp", "opencode", "shot.png");
  if (!token) {
    console.error("usage: node scripts/measure-fonts.js <token> [shot]");
    process.exit(1);
  }
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 480, height: 760, deviceScaleFactor: 2 });
  await page.goto(`${BASE}/invite/${token}`, { waitUntil: "networkidle0", timeout: 90000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1200));
  const rows = await page.evaluate(() => {
    const out = [];
    const els = Array.from(
      document.querySelectorAll('[class*="font-serif-custom"], [class*="font-sans-custom"]')
    );
    for (const el of els) {
      const txt = (el.textContent || "").trim();
      if (!txt) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      const ff = getComputedStyle(el).fontFamily.split(",")[0];
      const lines = Math.round(el.scrollHeight / (fs * 1.2));
      out.push({
        txt: txt.slice(0, 45),
        fontSize: fs,
        lines,
        width: Math.round(el.offsetWidth),
        height: Math.round(el.offsetHeight),
        scrollH: Math.round(el.scrollHeight),
        fontFamily: ff,
      });
    }
    return out;
  });
  await page.screenshot({ path: out });
  await browser.close();
  console.log(JSON.stringify(rows, null, 2));
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});