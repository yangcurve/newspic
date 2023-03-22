const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const { question } = require('readline-sync');

const operatingSystem = process.argv.at(2) === '32' ? ' (x86)' : '';
const adb = 'powershell -c ~\\newspic\\platform-tools\\adb.exe';

execSync(`${adb} shell svc usb setFunctions rndis`);
execSync(`${adb} shell svc wifi disable`);

const url = 'https://vodo.kr/JF6DyO8';

const sleep = (duration) => new Promise((r) => setTimeout(r, duration));
const loop = async (cnt) => {
  if (cnt > 2000) return;

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
      .then((t) => 7000 - t)
      .then((t) => (t <= 0 ? 500 : t));

    await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight));
    await sleep(duration);

    console.log(cnt++);
  } catch {
    // await sleep(3000);
  } finally {
    await browser.close();
  }

  return loop(cnt);
};

loop(1);
