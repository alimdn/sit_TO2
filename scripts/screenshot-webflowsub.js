const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    
    const htmlPath = path.resolve('/home/z/my-project/download/webflowsub-templates.html');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle', timeout: 30000 });
    
    await page.waitForTimeout(2000);
    
    // Full page screenshot
    await page.screenshot({
        path: '/home/z/my-project/download/webflowsub-preview.png',
        fullPage: true
    });
    
    // Viewport screenshot
    await page.screenshot({
        path: '/home/z/my-project/download/webflowsub-hero.png',
        fullPage: false
    });
    
    console.log('WebFlowSub screenshots taken!');
    await browser.close();
})();
