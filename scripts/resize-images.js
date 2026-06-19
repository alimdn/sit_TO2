const sharp = require('sharp');
const path = require('path');

const dir = '/home/z/my-project/download/templates';

async function resize() {
    // Create a smaller thumbnail (400px wide)
    await sharp(path.join(dir, 'edumentor-thumb.png'))
        .resize(400, null, { withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(path.join(dir, 'edumentor-thumb-sm.jpg'));
    
    // Create a medium preview (800px wide)
    await sharp(path.join(dir, 'edumentor-full.png'))
        .resize(800, null, { withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(path.join(dir, 'edumentor-preview.jpg'));
    
    // Create hero card (600x400)
    await sharp(path.join(dir, 'edumentor-hero.png'))
        .resize(600, 400, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(path.join(dir, 'edumentor-hero-sm.jpg'));
    
    console.log('Images resized!');
}

resize().catch(console.error);
