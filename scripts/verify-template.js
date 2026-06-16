const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Click on Templates nav link
    const templatesLink = await page.$('a:has-text("Templates"), button:has-text("Templates")');
    if (templatesLink) {
        await templatesLink.click();
        await page.waitForTimeout(2000);
    }
    
    // Take screenshot
    await page.screenshot({
        path: '/home/z/my-project/download/templates-page-verification.png',
        fullPage: true
    });
    
    console.log('Verification screenshot taken!');
    await browser.close();
})();
