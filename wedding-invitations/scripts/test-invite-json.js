const puppeteer = require("puppeteer-core");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = process.env.TEMP + "\\opencode";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 480, height: 900, deviceScaleFactor: 2 });
  await page.goto("http://localhost:3000/invite/31c3556673ccac5e98a6e95837fa39d7363af27555e8d7b0", {
    waitUntil: "networkidle0",
    timeout: 60000,
  });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: OUT + "\\invite-layoutjson.png" });
  const checks = await page.evaluate(() => ({
    hasFundoImg: !!document.querySelector('img[src*="fundo.png"]'),
    hasDiv1024: !![...document.querySelectorAll("div")].find(
      (el) => el.style.width === "1024px" && el.style.height === "1536px"
    ),
    hasAna: document.body.textContent.includes("Ana"),
    hasZlatan: document.body.textContent.includes("Zlatan"),
    hasPraia: document.body.textContent.includes("Praia do Bilene"),
    hasRSVP: document.body.textContent.includes("+258 84 000 0000"),
    hasConvidado: document.body.textContent.includes("Convidado:"),
  }));
  console.log(JSON.stringify(checks));
  await browser.close();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});