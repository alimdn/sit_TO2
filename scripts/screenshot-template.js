const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    
    const htmlPath = path.resolve('/home/z/my-project/download/templates/edumentor-ui-design.html');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for images and fonts to load
    await page.waitForTimeout(3000);
    
    // Full page screenshot for large preview
    await page.screenshot({
        path: '/home/z/my-project/download/templates/edumentor-full.png',
        fullPage: true
    });
    
    // Viewport screenshot for thumbnail
    await page.screenshot({
        path: '/home/z/my-project/download/templates/edumentor-thumb.png',
        fullPage: false
    });
    
    // Hero section only screenshot
    const heroSection = await page.$('section');
    if (heroSection) {
        await heroSection.screenshot({
            path: '/home/z/my-project/download/templates/edumentor-hero.png'
        });
    }
    
    console.log('Screenshots taken successfully!');
    await browser.close();
})();
