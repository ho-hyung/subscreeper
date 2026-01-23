const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const iconsDir = path.join(__dirname, "../public/icons");

// 아이콘 디렉토리 생성
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Subscreeper 로고 SVG (지갑 아이콘 + 초록색 배경)
const logoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981"/>
      <stop offset="100%" style="stop-color:#059669"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <g transform="translate(96, 96) scale(1.25)">
    <path d="M19 7h-1V6a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3zm-4 0H5a1 1 0 0 1 0-2h10a1 1 0 0 1 1 1v1z"
          fill="white"
          transform="translate(68, 68) scale(10)"/>
  </g>
</svg>
`;

// Badge용 SVG (작은 원형)
const badgeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
  <circle cx="36" cy="36" r="36" fill="#10b981"/>
  <text x="36" y="48" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="white">S</text>
</svg>
`;

// 아이콘 크기 정의
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  console.log("Generating icons...");

  // 메인 아이콘 생성
  for (const size of sizes) {
    await sharp(Buffer.from(logoSvg))
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
    console.log(`Created icon-${size}x${size}.png`);
  }

  // Badge 아이콘 생성
  await sharp(Buffer.from(badgeSvg))
    .resize(72, 72)
    .png()
    .toFile(path.join(iconsDir, "icon-72x72.png"));
  console.log("Created icon-72x72.png (badge)");

  // Apple Touch Icon
  await sharp(Buffer.from(logoSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, "apple-touch-icon.png"));
  console.log("Created apple-touch-icon.png");

  // Favicon (32x32)
  await sharp(Buffer.from(logoSvg))
    .resize(32, 32)
    .png()
    .toFile(path.join(iconsDir, "favicon-32x32.png"));
  console.log("Created favicon-32x32.png");

  // Favicon (16x16)
  await sharp(Buffer.from(logoSvg))
    .resize(16, 16)
    .png()
    .toFile(path.join(iconsDir, "favicon-16x16.png"));
  console.log("Created favicon-16x16.png");

  console.log("\nAll icons generated successfully!");
}

generateIcons().catch(console.error);
