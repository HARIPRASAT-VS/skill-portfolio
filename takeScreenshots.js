const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'docs', 'screenshots');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const PAGES = [
  { name: 'landing.png', url: 'http://localhost:5173/' },
  { name: 'dashboard.png', url: 'http://localhost:5173/dashboard' },
  { name: 'profile.png', url: 'http://localhost:5173/dashboard/profile' },
  { name: 'skills.png', url: 'http://localhost:5173/dashboard/skills' },
  { name: 'projects.png', url: 'http://localhost:5173/dashboard/projects' },
  { name: 'certifications.png', url: 'http://localhost:5173/dashboard/certifications' },
  { name: 'achievements.png', url: 'http://localhost:5173/dashboard/achievements' },
  { name: 'analytics.png', url: 'http://localhost:5173/dashboard/analytics' },
  { name: 'public-portfolio.png', url: 'http://localhost:5173/portfolio/hariprasat' }
];

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  for (const p of PAGES) {
    console.log(`Capturing ${p.name}...`);
    try {
      await page.goto(p.url, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 1000)); // wait for animations
      await page.screenshot({ path: path.join(OUTPUT_DIR, p.name) });
    } catch(e) {
      console.error(`Failed ${p.name}: ${e.message}`);
    }
  }

  await browser.close();
  console.log('Screenshots complete.');
}

run();
