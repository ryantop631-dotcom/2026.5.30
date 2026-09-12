const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function processUserAssets() {
  const userImgPath = '/tmp/user_uploaded_image.png';
  const publicDir = path.join(__dirname, '..', 'public');

  if (!fs.existsSync(userImgPath)) {
    throw new Error('/tmp/user_uploaded_image.png does not exist');
  }

  // Save copy of original user upload
  const originalUserBuf = fs.readFileSync(userImgPath);
  fs.writeFileSync(path.join(publicDir, 'user_original.png'), originalUserBuf);
  console.log('Saved user_original.png');

  // 1. Generate favicon.png (32x32) directly from user image
  await sharp(originalUserBuf)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Generated favicon.png (32x32) from user image');

  // 2. Generate apple-touch-icon.png (180x180) for iOS home screen shortcuts
  await sharp(originalUserBuf)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png (180x180) from user image');

  // 3. Generate icon-192.png (192x192) for Android / Chrome home screen shortcuts
  await sharp(originalUserBuf)
    .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('Generated icon-192.png (192x192) from user image');

  // 4. Generate icon-512.png (512x512)
  await sharp(originalUserBuf)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('Generated icon-512.png (512x512) from user image');

  // 5. Generate multi-size favicon.ico containing 16x16, 32x32, 48x48
  const png16 = await sharp(originalUserBuf).resize(16, 16).png().toBuffer();
  const png32 = await sharp(originalUserBuf).resize(32, 32).png().toBuffer();
  const png48 = await sharp(originalUserBuf).resize(48, 48).png().toBuffer();

  // ICO header for 3 images
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = ICO
  header.writeUInt16LE(3, 4); // 3 images

  let offset = 6 + (16 * 3); // 54 bytes
  const dir16 = Buffer.alloc(16);
  dir16.writeUInt8(16, 0);
  dir16.writeUInt8(16, 1);
  dir16.writeUInt8(0, 2);
  dir16.writeUInt8(0, 3);
  dir16.writeUInt16LE(1, 4);
  dir16.writeUInt16LE(32, 6);
  dir16.writeUInt32LE(png16.length, 8);
  dir16.writeUInt32LE(offset, 12);
  offset += png16.length;

  const dir32 = Buffer.alloc(16);
  dir32.writeUInt8(32, 0);
  dir32.writeUInt8(32, 1);
  dir32.writeUInt8(0, 2);
  dir32.writeUInt8(0, 3);
  dir32.writeUInt16LE(1, 4);
  dir32.writeUInt16LE(32, 6);
  dir32.writeUInt32LE(png32.length, 8);
  dir32.writeUInt32LE(offset, 12);
  offset += png32.length;

  const dir48 = Buffer.alloc(16);
  dir48.writeUInt8(48, 0);
  dir48.writeUInt8(48, 1);
  dir48.writeUInt8(0, 2);
  dir48.writeUInt8(0, 3);
  dir48.writeUInt16LE(1, 4);
  dir48.writeUInt16LE(32, 6);
  dir48.writeUInt32LE(png48.length, 8);
  dir48.writeUInt32LE(offset, 12);

  const icoBuf = Buffer.concat([header, dir16, dir32, dir48, png16, png32, png48]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);
  console.log('Generated favicon.ico with 16x16, 32x32, 48x48 from user image');

  // 6. Generate Open Graph preview banner (og-image.png, 1200x630) using user's EXACT image!
  // Resize user's image to 400x400 with a clean rounded border
  const userResized400 = await sharp(originalUserBuf)
    .resize(400, 400, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toBuffer();

  // Create rounded corner mask for user's image
  const roundedCornersMask = Buffer.from(
    '<svg><rect x="0" y="0" width="400" height="400" rx="32" ry="32"/></svg>'
  );
  const roundedUserImg = await sharp(userResized400)
    .composite([{ input: roundedCornersMask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Generate the background layout SVG
  const bannerBackgroundSvg = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#070A12"/>
          <stop offset="50%" stop-color="#0C101D"/>
          <stop offset="100%" stop-color="#121829"/>
        </linearGradient>
        <linearGradient id="blueAccent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0052FF"/>
          <stop offset="100%" stop-color="#3B82F6"/>
        </linearGradient>
        <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFFFFF" stroke-opacity="0.04" stroke-width="1"/>
        </pattern>
        <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.7"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bgGrad)"/>
      <rect width="1200" height="630" fill="url(#gridPattern)"/>

      <!-- Ambient Glows -->
      <circle cx="290" cy="315" r="280" fill="#0052FF" fill-opacity="0.22" filter="blur(60px)"/>
      <circle cx="1000" cy="180" r="220" fill="#3B82F6" fill-opacity="0.12" filter="blur(70px)"/>

      <!-- Card container frame for user image (Left Side) -->
      <g transform="translate(86, 111)" filter="url(#cardShadow)">
        <rect width="408" height="408" rx="36" fill="#0052FF"/>
        <rect x="4" y="4" width="400" height="400" rx="32" fill="#FFFFFF"/>
      </g>

      <!-- Right Side Content -->
      <g transform="translate(550, 125)">
        <!-- Tag Badge -->
        <rect width="216" height="38" rx="8" fill="#0052FF"/>
        <text x="108" y="24" fill="#FFFFFF" font-family="'Space Grotesk', -apple-system, sans-serif" font-size="14" font-weight="700" letter-spacing="1.5" text-anchor="middle">ROBOT CODING AREA</text>
        
        <!-- Main Titles -->
        <text x="0" y="115" fill="#FFFFFF" font-family="'Space Grotesk', -apple-system, sans-serif" font-size="54" font-weight="800" letter-spacing="-0.5">Kim Ju-won</text>
        <text x="0" y="170" fill="#3B82F6" font-family="'Space Grotesk', -apple-system, sans-serif" font-size="34" font-weight="700">PORTFOLIO &amp; LAB</text>

        <!-- Subtitles -->
        <text x="0" y="235" fill="#E2E8F0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="600">
          김주원의 로봇 공학 프로젝트 &amp; 포트폴리오
        </text>
        <text x="0" y="275" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400">
          Line Tracing · Sumo Robot · Mission Control · Coding
        </text>

        <!-- Shortcut & Preview status pills -->
        <g transform="translate(0, 325)">
          <rect width="185" height="44" rx="12" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
          <circle cx="24" cy="22" r="6" fill="#10B981"/>
          <text x="40" y="28" fill="#F1F5F9" font-family="-apple-system, sans-serif" font-size="15" font-weight="600">공식 바로가기</text>

          <g transform="translate(200, 0)">
            <rect width="180" height="44" rx="12" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
            <text x="90" y="28" fill="#93C5FD" font-family="-apple-system, sans-serif" font-size="15" font-weight="600" text-anchor="middle">Live Portfolio</text>
          </g>
        </g>
      </g>

      <!-- Bottom Gradient Line -->
      <rect x="0" y="622" width="1200" height="8" fill="url(#blueAccent)"/>
    </svg>
  `);

  // Composite user image onto the background banner
  await sharp(bannerBackgroundSvg)
    .composite([
      {
        input: roundedUserImg,
        top: 115,
        left: 90
      }
    ])
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('Generated og-image.png (1200x630) compositing user original drawing');

  // Also create a square shortcut banner preview
  await sharp(originalUserBuf)
    .resize(600, 600, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'shortcut-preview.png'));
  console.log('Generated shortcut-preview.png (600x600)');
}

processUserAssets().catch(err => {
  console.error(err);
  process.exit(1);
});
