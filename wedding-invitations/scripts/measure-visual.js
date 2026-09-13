const puppeteer = require("puppeteer-core");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: "new", args: ["--no-sandbox","--disable-gpu"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 480, height: 900, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3000/invite/31c3556673ccac5e98a6e95837fa39d7363af27555e8d7b0", { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise(r=>setTimeout(r,2000));
  const rows = await page.evaluate(() => {
    const layered = [...document.querySelectorAll("div")].find(el => el.style.width === "1024px" && el.style.height === "1536px");
    const m = layered?.style.transform.match(/scale\(([0-9.]+)\)/);
    const scale = m ? parseFloat(m[1]) : null;
    const get = (txt) => {
      for (const el of [...document.querySelectorAll("div")]) {
        if ((el.textContent||"").trim() === txt) {
          const fs = parseFloat(getComputedStyle(el).fontSize) * (scale ?? 1);
          const r = el.getBoundingClientRect();
          return { visualFs: Math.round(fs*10)/10, visualW: Math.round(r.width) };
        }
      }
      return null;
    };
    return { scale, ana: get("Ana"), zlatan: get("Zlatan"), hora: get("14:00"), local: get("Praia do Bilene") };
  });
  console.log(JSON.stringify(rows, null, 2));
  await page.screenshot({ path: (process.env.TEMP||"C:\\Users\\Acer\\AppData\\Local\\Temp") + "\\opencode\\invite-layoutjson-fix.png" });
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
