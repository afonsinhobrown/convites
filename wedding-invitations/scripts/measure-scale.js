const puppeteer = require("puppeteer-core");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: "new", args: ["--no-sandbox","--disable-gpu"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 480, height: 900 });
  await page.goto("http://localhost:3000/invite/31c3556673ccac5e98a6e95837fa39d7363af27555e8d7b0", { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise(r=>setTimeout(r,2000));
  const info = await page.evaluate(() => {
    const layered = [...document.querySelectorAll("div")].find(el => el.style.width === "1024px" && el.style.height === "1536px");
    let scale = null;
    if (layered) {
      const m = layered.style.transform.match(/scale\(([0-9.]+)\)/);
      scale = m ? parseFloat(m[1]) : null;
    }
    return { scale, viewport: window.innerWidth };
  });
  console.log(JSON.stringify(info));
  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
