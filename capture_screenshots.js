import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('Coding_Proof_Screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Helper to wait for server to be responsive
function waitForServer(url, timeoutMs = 15000) {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          retry();
        }
      }).on('error', () => {
        retry();
      });
    };

    const retry = () => {
      if (Date.now() - startTime > timeoutMs) {
        reject(new Error(`Timeout waiting for ${url}`));
      } else {
        setTimeout(check, 500);
      }
    };

    check();
  });
}

async function run() {
  console.log('--- Starting Screenshot Capture Pipeline ---');

  // 1. Ensure Vite server is active on port 3000
  let serverProcess = null;
  let serverReady = false;

  try {
    await waitForServer('http://localhost:3000', 2000);
    console.log('Found existing server running on http://localhost:3000');
    serverReady = true;
  } catch (e) {
    console.log('Starting local Vite preview/dev server on port 3000...');
    serverProcess = spawn('npx.cmd', ['vite', '--port', '3000'], { shell: true });
    serverProcess.stdout.on('data', d => console.log('[Vite]', d.toString().trim()));
    serverProcess.stderr.on('data', d => console.log('[Vite Err]', d.toString().trim()));
    await waitForServer('http://localhost:3000', 15000);
    serverReady = true;
    console.log('Vite server started successfully.');
  }

  // 2. Launch Puppeteer with high-DPI
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1500,1050']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960, deviceScaleFactor: 2 });

  // Navigate to application
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  // Helper to click sidebar nav by text
  async function clickNav(text) {
    const buttons = await page.$$('aside button');
    for (const btn of buttons) {
      const btnText = await page.evaluate(el => el.textContent, btn);
      if (btnText.includes(text)) {
        await btn.click();
        await new Promise(r => setTimeout(r, 800));
        return;
      }
    }
    console.warn(`Could not find nav button for: ${text}`);
  }

  // Helper to click header simulation button
  async function clickSimBtn(text) {
    const buttons = await page.$$('header button, main button');
    for (const btn of buttons) {
      const btnText = await page.evaluate(el => el.textContent, btn);
      if (btnText.trim().toLowerCase().includes(text.toLowerCase())) {
        await btn.click();
        await new Promise(r => setTimeout(r, 1000));
        return;
      }
    }
  }

  // 1. Capture Dashboard Overview
  console.log('Capturing: 01_dashboard_overview.png');
  await clickNav('Network Overview');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_dashboard_overview.png') });

  // 2. Capture Bandwidth Monitoring
  console.log('Capturing: 02_bandwidth_monitoring.png');
  await clickNav('Bandwidth Monitoring');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_bandwidth_monitoring.png') });

  // 3. Capture Device Monitoring
  console.log('Capturing: 03_device_monitoring.png');
  await clickNav('Device Monitoring');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_device_monitoring.png') });

  // 4. Capture Device Drilldown Modal
  console.log('Capturing: 04_device_drilldown.png');
  const drilldownBtn = await page.$('table button');
  if (drilldownBtn) {
    await drilldownBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_device_drilldown.png') });
    // Close modal
    const closeBtn = await page.$('button[class*="rounded-2xl"] button, button:has(svg)');
    await page.keyboard.press('Escape');
    // or click close button
    const closeButtons = await page.$$('button');
    for (const b of closeButtons) {
      const t = await page.evaluate(el => el.textContent, b);
      if (t.includes('Close Details')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 500));
  }

  // 5. Capture Network Topology
  console.log('Capturing: 05_network_topology.png');
  await clickNav('Network Topology');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_network_topology.png') });

  // 6. Capture How The System Works
  console.log('Capturing: 06_how_it_works.png');
  await clickNav('How It Works');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_how_it_works.png') });

  // 7. Capture Settings Page
  console.log('Capturing: 07_settings_page.png');
  await clickNav('Settings');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_settings_page.png') });

  // 8. Capture Congestion Detection - Normal Condition
  console.log('Capturing: 08_normal_condition.png');
  await clickNav('Congestion Detection');
  await clickSimBtn('1. Normal Traffic');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_normal_condition.png') });

  // 9. Capture Congestion Detection - Warning Condition
  console.log('Capturing: 09_warning_condition.png');
  await clickSimBtn('2. Trigger Warning');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_warning_condition.png') });

  // 10. Capture Alert Management - Active Warning Alert
  console.log('Capturing: 10_alert_warning.png');
  await clickNav('Alert Management');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_alert_warning.png') });

  // 11. Trigger Critical Congestion & Capture Congestion Page
  console.log('Capturing: 11_critical_condition.png');
  await clickNav('Congestion Detection');
  await clickSimBtn('3. Trigger Critical');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_critical_condition.png') });

  // 12. Alert Management - Active Critical Alert with Problem Resolution Question
  console.log('Capturing: 12_alert_management_active.png');
  await clickNav('Alert Management');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_alert_management_active.png') });

  // 13. Select "NO - Problem Not Resolved"
  console.log('Capturing: 13_problem_not_resolved.png');
  const noButtons = await page.$$('button');
  for (const b of noButtons) {
    const t = await page.evaluate(el => el.textContent, b);
    if (t.includes('NO - Problem Not Resolved')) {
      await b.click();
      await new Promise(r => setTimeout(r, 800));
      break;
    }
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_problem_not_resolved.png') });

  // 14. Select "YES - Problem Resolved"
  console.log('Capturing: 14_problem_resolved_history.png');
  const yesButtons = await page.$$('button');
  for (const b of yesButtons) {
    const t = await page.evaluate(el => el.textContent, b);
    if (t.includes('YES - Problem Resolved')) {
      await b.click();
      await new Promise(r => setTimeout(r, 800));
      break;
    }
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14_problem_resolved_history.png') });

  // Reset simulation for clean state
  await clickSimBtn('Reset');

  // Close browser and server if spawned
  await browser.close();
  if (serverProcess) {
    serverProcess.kill();
  }

  console.log('--- Finished Capturing All Application Screenshots Successfully ---');
}

run().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
