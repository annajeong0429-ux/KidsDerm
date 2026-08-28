const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const outDir = path.join(__dirname, "..", "..", "screens");
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.fill('input[type=email]', 'consentcheck@example.com');
  await page.fill('input[type=password]', 'Password123!');
  await page.click('button[type=submit]');
  await page.waitForTimeout(1500);

  await page.goto("http://localhost:3000/cases/case-1/chart", { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(outDir, "chart-area.png") });

  await page.getByRole('button', { name: '4징후 점수' }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outDir, "chart-signs.png") });

  console.log("done");
  await browser.close();
})();
