const { chromium } = require('playwright');
const path = require('path');
const sharp = require('sharp');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    
    const htmlPath = path.resolve('/home/z/my-project/public/templates/edumentor-course-platform.html');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for images and fonts
    await page.waitForTimeout(3000);
    
    // Take high-quality viewport screenshot
    const rawPath = '/home/z/my-project/public/images/template-education-raw.png';
    await page.screenshot({ path: rawPath, fullPage: false });
    
    // Take hero section screenshot (best for card thumbnail)
    const heroSection = await page.$('section');
    if (heroSection) {
        await heroSection.screenshot({ path: '/home/z/my-project/public/images/template-education-hero.png' });
    }
    
    console.log('Screenshots taken!');
    await browser.close();
    
    // Now resize for the card thumbnail (similar size to existing templates ~800x500)
    await sharp(rawPath)
        .resize(800, 500, { fit: 'cover', position: 'top' })
        .png()
        .toFile('/home/z/my-project/public/images/template-education.png');
    
    console.log('Thumbnail created at public/images/template-education.png');
})();
