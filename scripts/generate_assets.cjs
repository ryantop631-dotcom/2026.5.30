const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. The exact vector representation of the user's hand-drawn character drawing
const characterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#FFFFFF"/>
  
  <!-- Head Outline: Hand-drawn organic rounded head -->
  <path d="M 256 60 
           C 340 58, 410 75, 440 120 
           C 475 170, 485 230, 480 300 
           C 475 365, 445 425, 385 460 
           C 330 490, 275 495, 230 493 
           C 160 490, 100 460, 65 410 
           C 30 355, 35 280, 45 210 
           C 55 140, 115 65, 256 60 Z" 
        fill="#FFFFFF" 
        stroke="#111111" 
        stroke-width="12" 
        stroke-linecap="round" 
        stroke-linejoin="round"/>

  <!-- Left Eyebrow: Horizontal hand-drawn line -->
  <path d="M 75 230 Q 155 235 238 238" 
        fill="none" 
        stroke="#111111" 
        stroke-width="11" 
        stroke-linecap="round"/>

  <!-- Right Eyebrow: Horizontal hand-drawn line -->
  <path d="M 305 240 Q 380 236 450 232" 
        fill="none" 
        stroke="#111111" 
        stroke-width="11" 
        stroke-linecap="round"/>

  <!-- Left Eye: Small vertical/diagonal tick mark -->
  <path d="M 162 260 L 157 278" 
        fill="none" 
        stroke="#111111" 
        stroke-width="11" 
        stroke-linecap="round"/>

  <!-- Right Eye: Small vertical/diagonal tick mark -->
  <path d="M 328 266 L 324 284" 
        fill="none" 
        stroke="#111111" 
        stroke-width="11" 
        stroke-linecap="round"/>

  <!-- Lips Outline & Fill: Big iconic bright red lips -->
  <!-- Upper & Lower Lip Body -->
  <path d="M 168 395 
           C 168 358, 206 345, 238 358 
           C 248 362, 253 378, 256 388 
           C 259 378, 264 362, 274 358 
           C 306 345, 344 358, 344 395 
           C 344 435, 310 458, 256 458 
           C 202 458, 168 435, 168 395 Z" 
        fill="#EE1C24" 
        stroke="#111111" 
        stroke-width="11" 
        stroke-linejoin="round"/>

  <!-- Center mouth dividing line with cupid dip -->
  <path d="M 170 395 Q 220 402 256 405 Q 292 402 342 395" 
        fill="none" 
        stroke="#111111" 
        stroke-width="11" 
        stroke-linecap="round"/>
</svg>`;

// 2. Open Graph & Shortcut Preview Banner (1200 x 630)
const ogBannerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0A0D14"/>
      <stop offset="50%" stop-color="#0E131F"/>
      <stop offset="100%" stop-color="#141B2D"/>
    </linearGradient>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0052FF"/>
      <stop offset="100%" stop-color="#3B82F6"/>
    </linearGradient>
    <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFFFFF" stroke-opacity="0.04" stroke-width="1"/>
    </pattern>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <rect width="1200" height="630" fill="url(#gridPattern)"/>

  <!-- Ambient Glow -->
  <circle cx="280" cy="315" r="260" fill="#0052FF" fill-opacity="0.18" filter="blur(60px)"/>
  <circle cx="950" cy="150" r="220" fill="#EE1C24" fill-opacity="0.12" filter="blur(70px)"/>

  <!-- Character Card (Left Side) -->
  <g transform="translate(100, 105)" filter="url(#cardShadow)">
    <rect width="420" height="420" rx="36" fill="#FFFFFF" stroke="#0052FF" stroke-width="4"/>
    
    <!-- Embedded User Character -->
    <g transform="translate(20, 20) scale(0.742)">
      <!-- Head Outline -->
      <path d="M 256 60 
               C 340 58, 410 75, 440 120 
               C 475 170, 485 230, 480 300 
               C 475 365, 445 425, 385 460 
               C 330 490, 275 495, 230 493 
               C 160 490, 100 460, 65 410 
               C 30 355, 35 280, 45 210 
               C 55 140, 115 65, 256 60 Z" 
            fill="#FFFFFF" 
            stroke="#111111" 
            stroke-width="12" 
            stroke-linecap="round" 
            stroke-linejoin="round"/>

      <!-- Left Eyebrow -->
      <path d="M 75 230 Q 155 235 238 238" 
            fill="none" 
            stroke="#111111" 
            stroke-width="11" 
            stroke-linecap="round"/>

      <!-- Right Eyebrow -->
      <path d="M 305 240 Q 380 236 450 232" 
            fill="none" 
            stroke="#111111" 
            stroke-width="11" 
            stroke-linecap="round"/>

      <!-- Left Eye -->
      <path d="M 162 260 L 157 278" 
            fill="none" 
            stroke="#111111" 
            stroke-width="11" 
            stroke-linecap="round"/>

      <!-- Right Eye -->
      <path d="M 328 266 L 324 284" 
            fill="none" 
            stroke="#111111" 
            stroke-width="11" 
            stroke-linecap="round"/>

      <!-- Lips -->
      <path d="M 168 395 
               C 168 358, 206 345, 238 358 
               C 248 362, 253 378, 256 388 
               C 259 378, 264 362, 274 358 
               C 306 345, 344 358, 344 395 
               C 344 435, 310 458, 256 458 
               C 202 458, 168 435, 168 395 Z" 
            fill="#EE1C24" 
            stroke="#111111" 
            stroke-width="11" 
            stroke-linejoin="round"/>

      <!-- Lip center line -->
      <path d="M 170 395 Q 220 402 256 405 Q 292 402 342 395" 
            fill="none" 
            stroke="#111111" 
            stroke-width="11" 
            stroke-linecap="round"/>
    </g>
  </g>

  <!-- Right Side: Content & Typography -->
  <!-- Category Badge -->
  <g transform="translate(580, 130)">
    <rect width="210" height="38" rx="8" fill="#0052FF"/>
    <text x="105" y="24" fill="#FFFFFF" font-family="'Space Grotesk', -apple-system, sans-serif" font-size="14" font-weight="700" letter-spacing="1.5" text-anchor="middle">ROBOT CODING AREA</text>
  </g>

  <!-- Main Title -->
  <text x="580" y="235" fill="#FFFFFF" font-family="'Space Grotesk', -apple-system, sans-serif" font-size="52" font-weight="800" letter-spacing="-0.5">Kim Ju-won</text>
  <text x="580" y="295" fill="#3B82F6" font-family="'Space Grotesk', -apple-system, sans-serif" font-size="34" font-weight="700">PORTFOLIO &amp; LAB</text>

  <!-- Description -->
  <text x="580" y="365" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="500">
    김주원의 로봇 공학 프로젝트 &amp; 포트폴리오
  </text>
  <text x="580" y="405" fill="#64748B" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18">
    Line Tracing · Sumo Robot · Mission Control · Coding
  </text>

  <!-- Feature Tags / Shortcut Indicator -->
  <g transform="translate(580, 460)">
    <rect width="160" height="42" rx="10" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
    <circle cx="24" cy="21" r="6" fill="#10B981"/>
    <text x="42" y="27" fill="#E2E8F0" font-family="-apple-system, sans-serif" font-size="15" font-weight="600">Active Live</text>

    <g transform="translate(180, 0)">
      <rect width="200" height="42" rx="10" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
      <text x="100" y="27" fill="#E2E8F0" font-family="-apple-system, sans-serif" font-size="15" font-weight="600" text-anchor="middle">Official Shortcut</text>
    </g>
  </g>

  <!-- Bottom Accent Bar -->
  <rect x="0" y="622" width="1200" height="8" fill="url(#blueGrad)"/>
</svg>`;

async function run() {
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Write SVG files
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), characterSvg);
  console.log('Written favicon.svg');

  // 2. Generate PNGs from character SVG
  const charSvgBuffer = Buffer.from(characterSvg);

  // Favicon PNG (32x32)
  await sharp(charSvgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Generated favicon.png (32x32)');

  // Apple Touch Icon (180x180) - used for mobile homescreen shortcuts!
  await sharp(charSvgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png (180x180)');

  // PWA / Android Shortcut Icons
  await sharp(charSvgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('Generated icon-192.png (192x192)');

  await sharp(charSvgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('Generated icon-512.png (512x512)');

  // 3. Generate OG Image (1200x630) for link preview & browser shortcut card
  const ogSvgBuffer = Buffer.from(ogBannerSvg);
  await sharp(ogSvgBuffer)
    .resize(1200, 630)
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('Generated og-image.png (1200x630)');

  // 4. Create standard multi-size ICO file containing the PNG
  // A valid ICO file containing PNG data:
  // Header: 2 bytes reserved (0), 2 bytes type (1 for ico), 2 bytes count (1)
  // Entry: width (32), height (32), colors (0), reserved (0), planes (1), bpp (32), size (N), offset (22)
  const png32 = await sharp(charSvgBuffer).resize(32, 32).png().toBuffer();
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // reserved
  icoHeader.writeUInt16LE(1, 2); // icon type
  icoHeader.writeUInt16LE(1, 4); // 1 image

  const icoEntry = Buffer.alloc(16);
  icoEntry.writeUInt8(32, 0); // width
  icoEntry.writeUInt8(32, 1); // height
  icoEntry.writeUInt8(0, 2); // colors
  icoEntry.writeUInt8(0, 3); // reserved
  icoEntry.writeUInt16LE(1, 4); // planes
  icoEntry.writeUInt16LE(32, 6); // bit count
  icoEntry.writeUInt32LE(png32.length, 8); // image size
  icoEntry.writeUInt32LE(22, 12); // offset (6 + 16 = 22)

  const icoBuffer = Buffer.concat([icoHeader, icoEntry, png32]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('Generated favicon.ico with user character drawing');

  // 5. Create manifest.json for PWA and Home Screen Shortcut
  const manifest = {
    name: "Kim Ju-won | ROBOT CODING AREA",
    short_name: "Kim Ju-won Robot",
    description: "김주원의 로봇 공학 프로젝트 및 포트폴리오 전시관",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#0052FF",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png"
      }
    ]
  };
  fs.writeFileSync(path.join(publicDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('Generated manifest.json');
}

run().catch(console.error);
