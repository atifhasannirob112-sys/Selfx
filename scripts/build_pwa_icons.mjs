import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

async function buildIcons() {
  const srcPath = path.join(process.cwd(), 'src/assets/images/selfx_new_logo_1790933252524.jpg');
  const pubDir = path.join(process.cwd(), 'public');

  if (!fs.existsSync(srcPath)) {
    console.error('Source image not found:', srcPath);
    process.exit(1);
  }

  // 192x192 PNG
  await sharp(srcPath).resize(192, 192, { fit: 'cover' }).png().toFile(path.join(pubDir, 'icon-192.png'));
  await sharp(srcPath).resize(192, 192, { fit: 'cover' }).png().toFile(path.join(pubDir, 'pwa-192x192.png'));

  // 512x512 PNG
  await sharp(srcPath).resize(512, 512, { fit: 'cover' }).png().toFile(path.join(pubDir, 'icon-512.png'));
  await sharp(srcPath).resize(512, 512, { fit: 'cover' }).png().toFile(path.join(pubDir, 'pwa-512x512.png'));

  // 512x512 Maskable PNG (with safe zone padding on #050507 cosmic black background)
  const inner410 = await sharp(srcPath).resize(410, 410, { fit: 'cover' }).png().toBuffer();
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 5, g: 5, b: 7, alpha: 1 }
    }
  })
    .composite([{ input: inner410, gravity: 'center' }])
    .png()
    .toFile(path.join(pubDir, 'icon-maskable-512.png'));

  await fs.promises.copyFile(path.join(pubDir, 'icon-maskable-512.png'), path.join(pubDir, 'pwa-maskable-512x512.png'));

  // 180x180 Apple Touch Icon
  await sharp(srcPath).resize(180, 180, { fit: 'cover' }).png().toFile(path.join(pubDir, 'apple-touch-icon.png'));

  // 64x64 Favicon PNG
  await sharp(srcPath).resize(64, 64, { fit: 'cover' }).png().toFile(path.join(pubDir, 'favicon.png'));

  console.log('All PWA icons generated successfully!');
}

buildIcons();
