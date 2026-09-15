import fs from "fs";

const EDGE_PATHS = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];
const CHROME_PATHS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

function findBrowser(): string {
  for (const p of [...EDGE_PATHS, ...CHROME_PATHS]) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("Nenhum browser Chromium encontrado (Edge ou Chrome)");
}

export interface ScreenshotResult {
  name: string;
  buffer: Buffer;
}

// Tira screenshots de várias URLs reutilizando o mesmo browser.
export async function screenshotUrls(
  targets: { name: string; url: string }[],
  viewportWidth = 1024,
  viewportHeight = 1536
): Promise<ScreenshotResult[]> {
  const puppeteer = (await import("puppeteer-core")).default;
  const browser = await puppeteer.launch({
    executablePath: findBrowser(),
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });

  try {
    const results: ScreenshotResult[] = [];
    for (const target of targets) {
      const page = await browser.newPage();
      try {
        await page.setViewport({
          width: viewportWidth,
          height: viewportHeight,
          deviceScaleFactor: 1,
        });

        await page.goto(target.url, { waitUntil: "networkidle0", timeout: 30_000 });

        // Garantir que as fontes e imagens estão carregadas
        await page.evaluate(() => document.fonts.ready);
        await new Promise((r) => setTimeout(r, 500));

        const buffer = await page.screenshot({
          type: "png",
          clip: { x: 0, y: 0, width: viewportWidth, height: viewportHeight },
        });

        results.push({ name: target.name, buffer: Buffer.from(buffer) });
      } finally {
        await page.close();
      }
    }
    return results;
  } finally {
    await browser.close();
  }
}