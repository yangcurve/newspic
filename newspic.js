const puppeteer = require('puppeteer');
const { execSync } = require('node:child_process');
const { question } = require('readline-sync');

const operatingSystem = process.argv.at(2) === '32' ? ' (x86)' : '';
const adb = 'powershell -c ~\\newspic\\platform-tools\\adb.exe';
const url = question('url: ');

execSync(`${adb} shell svc wifi disable`);

const sleep = async (duration) => new Promise((r) => setTimeout(r, duration));
const loop = async (cnt) => {
  execSync(`${adb} shell svc data disable`);
  execSync(`${adb} shell svc data enable`);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: `C:\\Program Files${operatingSystem}\\Google\\Chrome\\Application\\chrome.exe`,
  });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    const duration = await page
      .metrics()
      .then((met) => met.Timestamp / 1000)
      .then((t) => 15000 - t)
      .then((t) => (t <= 0 ? 500 : t));
    console.log(duration);

    await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight));
    await sleep(duration);

    console.log(++cnt);
  } catch {
    // await sleep(3000);
  } finally {
    await browser.close();
  }

  return loop(cnt);
};

(async () => await loop(0))();
