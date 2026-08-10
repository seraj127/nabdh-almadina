/**
 * Generate proper Android adaptive icon foreground PNGs and legacy launcher icons.
 *
 * Adaptive icons (Android 8+):
 *   - Foreground on a 108dp canvas with icon content in the 66dp safe center zone
 *   - 21dp transparent padding on each side
 *
 * Legacy icons (pre-Android 8):
 *   - Icon on a rounded-square background fill
 *   - Standard launcher sizes
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = '/home/z/my-project';
const SOURCE_ICON = path.join(PROJECT_ROOT, 'resources/icon.png');
const RES_DIR = path.join(PROJECT_ROOT, 'android/app/src/main/res');

// Brand color
const BRAND_COLOR = '#004B63';

// ─── Density configs ────────────────────────────────────────────────────────

interface DensityConfig {
  density: string;
  // Adaptive icon foreground: 108dp canvas
  foregroundSize: number; // 108 * density multiplier
  // Legacy ic_launcher: 48dp
  launcherSize: number;   // 48 * density multiplier
}

const DENSITIES: DensityConfig[] = [
  { density: 'ldpi',    foregroundSize: 81,  launcherSize: 36  },
  { density: 'mdpi',    foregroundSize: 108, launcherSize: 48  },
  { density: 'hdpi',    foregroundSize: 162, launcherSize: 72  },
  { density: 'xhdpi',   foregroundSize: 216, launcherSize: 96  },
  { density: 'xxhdpi',  foregroundSize: 324, launcherSize: 144 },
  { density: 'xxxhdpi', foregroundSize: 432, launcherSize: 192 },
];

// The safe zone is 66/108 of the canvas — icon content must fit within this
const SAFE_ZONE_RATIO = 66 / 108; // ≈ 0.6111

// ─── Helper: Create rounded rectangle SVG ───────────────────────────────────

function roundedRectSvg(
  width: number,
  height: number,
  cornerRadius: number,
  fill: string
): string {
  const r = Math.min(cornerRadius, width / 2, height / 2);
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" rx="${r}" ry="${r}" fill="${fill}"/>
  </svg>`;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('🎨 Android Adaptive Icon Generator');
  console.log('==================================\n');

  // Verify source icon
  if (!fs.existsSync(SOURCE_ICON)) {
    console.error(`❌ Source icon not found: ${SOURCE_ICON}`);
    process.exit(1);
  }

  const sourceMeta = await sharp(SOURCE_ICON).metadata();
  console.log(`📦 Source icon: ${SOURCE_ICON}`);
  console.log(`   Size: ${sourceMeta.width}x${sourceMeta.height}, Format: ${sourceMeta.format}, Channels: ${sourceMeta.channels}\n`);

  if (sourceMeta.width !== 1024 || sourceMeta.height !== 1024) {
    console.warn(`⚠️  Expected 1024x1024 source, got ${sourceMeta.width}x${sourceMeta.height}. Proceeding anyway.`);
  }

  const results: { file: string; width: number; height: number; size: number }[] = [];

  for (const config of DENSITIES) {
    const mipmapDir = path.join(RES_DIR, `mipmap-${config.density}`);
    fs.mkdirSync(mipmapDir, { recursive: true });

    console.log(`\n── Density: ${config.density} ──`);
    console.log(`   Foreground canvas: ${config.foregroundSize}x${config.foregroundSize}px`);
    console.log(`   Legacy launcher:   ${config.launcherSize}x${config.launcherSize}px`);

    // ── 1. Adaptive icon foreground (ic_launcher_foreground.png) ──
    // Transparent canvas at 108dp × density, icon scaled to 66dp safe zone, centered
    const fgCanvasSize = config.foregroundSize;
    const fgIconSize = Math.round(fgCanvasSize * SAFE_ZONE_RATIO);
    const fgOffset = Math.round((fgCanvasSize - fgIconSize) / 2);

    const foregroundBuf = await sharp(SOURCE_ICON)
      .resize(fgIconSize, fgIconSize, { fit: 'fill' })
      .ensureAlpha()
      .toBuffer();

    const fgComposited = await sharp({
      create: {
        width: fgCanvasSize,
        height: fgCanvasSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([{
        input: foregroundBuf,
        left: fgOffset,
        top: fgOffset,
      }])
      .png()
      .toBuffer();

    const fgPath = path.join(mipmapDir, 'ic_launcher_foreground.png');
    fs.writeFileSync(fgPath, fgComposited);
    const fgStat = fs.statSync(fgPath);
    const fgMeta = await sharp(fgPath).metadata();
    console.log(`   ✅ ic_launcher_foreground.png → ${fgMeta.width}x${fgMeta.height} (${(fgStat.size / 1024).toFixed(1)}KB)`);
    results.push({ file: fgPath, width: fgMeta.width!, height: fgMeta.height!, size: fgStat.size });

    // ── 2. Legacy ic_launcher.png ──
    // Rounded square background + icon centered on top
    const lSize = config.launcherSize;
    const cornerRadius = Math.round(lSize * 0.22); // ~22% corner radius for Android-style squircle
    const iconInset = Math.round(lSize * 0.12); // 12% padding inside the rounded square
    const iconDrawSize = lSize - 2 * iconInset;

    // Create rounded square background
    const bgSvg = roundedRectSvg(lSize, lSize, cornerRadius, BRAND_COLOR);
    const bgBuf = await sharp(Buffer.from(bgSvg)).png().toBuffer();

    // Resize icon to fit within the rounded square with some padding
    const iconBuf = await sharp(SOURCE_ICON)
      .resize(iconDrawSize, iconDrawSize, { fit: 'fill' })
      .ensureAlpha()
      .toBuffer();

    const launcherBuf = await sharp(bgBuf)
      .composite([{
        input: iconBuf,
        left: iconInset,
        top: iconInset,
      }])
      .png()
      .toBuffer();

    const launcherPath = path.join(mipmapDir, 'ic_launcher.png');
    fs.writeFileSync(launcherPath, launcherBuf);
    const lStat = fs.statSync(launcherPath);
    const lMeta = await sharp(launcherPath).metadata();
    console.log(`   ✅ ic_launcher.png → ${lMeta.width}x${lMeta.height} (${(lStat.size / 1024).toFixed(1)}KB)`);
    results.push({ file: launcherPath, width: lMeta.width!, height: lMeta.height!, size: lStat.size });

    // ── 3. Legacy ic_launcher_round.png ──
    // Circular background + icon centered on top
    const circleRadius = lSize / 2;
    const circleSvg = `<svg width="${lSize}" height="${lSize}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${circleRadius}" cy="${circleRadius}" r="${circleRadius}" fill="${BRAND_COLOR}"/>
    </svg>`;
    const circleBuf = await sharp(Buffer.from(circleSvg)).png().toBuffer();

    // Icon inset slightly more for round (circular safe zone is smaller)
    const roundInset = Math.round(lSize * 0.18);
    const roundIconSize = lSize - 2 * roundInset;

    const roundIconBuf = await sharp(SOURCE_ICON)
      .resize(roundIconSize, roundIconSize, { fit: 'fill' })
      .ensureAlpha()
      .toBuffer();

    const roundBuf = await sharp(circleBuf)
      .composite([{
        input: roundIconBuf,
        left: roundInset,
        top: roundInset,
      }])
      .png()
      .toBuffer();

    const roundPath = path.join(mipmapDir, 'ic_launcher_round.png');
    fs.writeFileSync(roundPath, roundBuf);
    const rStat = fs.statSync(roundPath);
    const rMeta = await sharp(roundPath).metadata();
    console.log(`   ✅ ic_launcher_round.png → ${rMeta.width}x${rMeta.height} (${(rStat.size / 1024).toFixed(1)}KB)`);
    results.push({ file: roundPath, width: rMeta.width!, height: rMeta.height!, size: rStat.size });

    // ── 4. ic_launcher_background.png (per-density, solid color) ──
    // A small solid-color PNG for the adaptive icon background layer
    // (used if not referencing @color/ic_launcher_background)
    const bgPngBuf = await sharp({
      create: {
        width: fgCanvasSize,
        height: fgCanvasSize,
        channels: 4,
        background: BRAND_COLOR,
      },
    })
      .png()
      .toBuffer();

    const bgPngPath = path.join(mipmapDir, 'ic_launcher_background.png');
    fs.writeFileSync(bgPngPath, bgPngBuf);
    const bgPngStat = fs.statSync(bgPngPath);
    console.log(`   ✅ ic_launcher_background.png → ${fgCanvasSize}x${fgCanvasSize} (${(bgPngStat.size / 1024).toFixed(1)}KB)`);
    results.push({ file: bgPngPath, width: fgCanvasSize, height: fgCanvasSize, size: bgPngStat.size });
  }

  // ── 5. Update ic_launcher_background.xml color ──
  const bgXmlPath = path.join(RES_DIR, 'values/ic_launcher_background.xml');
  const newXmlContent = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#004B63</color>
</resources>`;
  fs.writeFileSync(bgXmlPath, newXmlContent);
  console.log(`\n🎨 Updated ${bgXmlPath} → background color: ${BRAND_COLOR}`);

  // ── Summary ──
  console.log('\n\n📊 GENERATION SUMMARY');
  console.log('='.repeat(70));
  console.log(`${'File'.padEnd(65)} ${'WxH'.padEnd(10)} Size`);
  console.log('-'.repeat(85));
  for (const r of results) {
    const relPath = path.relative(PROJECT_ROOT, r.file);
    console.log(`${relPath.padEnd(65)} ${`${r.width}x${r.height}`.padEnd(10)} ${(r.size / 1024).toFixed(1)}KB`);
  }
  console.log(`\n✅ Total: ${results.length} files generated`);

  // ── Verification ──
  console.log('\n\n🔍 VERIFICATION');
  console.log('='.repeat(70));

  let allOk = true;
  const expectedForegroundSizes: Record<string, number> = {
    ldpi: 81, mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432,
  };
  const expectedLauncherSizes: Record<string, number> = {
    ldpi: 36, mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192,
  };

  for (const config of DENSITIES) {
    const d = config.density;
    const mipmapDir = path.join(RES_DIR, `mipmap-${d}`);

    // Check foreground
    const fgPath = path.join(mipmapDir, 'ic_launcher_foreground.png');
    if (!fs.existsSync(fgPath)) {
      console.log(`   ❌ ${d}: ic_launcher_foreground.png MISSING`);
      allOk = false;
    } else {
      const meta = await sharp(fgPath).metadata();
      if (meta.width !== expectedForegroundSizes[d] || meta.height !== expectedForegroundSizes[d]) {
        console.log(`   ❌ ${d}: ic_launcher_foreground.png wrong size: ${meta.width}x${meta.height} (expected ${expectedForegroundSizes[d]}x${expectedForegroundSizes[d]})`);
        allOk = false;
      } else {
        console.log(`   ✅ ${d}: ic_launcher_foreground.png = ${meta.width}x${meta.height} ✔`);
      }
    }

    // Check launcher
    const lPath = path.join(mipmapDir, 'ic_launcher.png');
    if (!fs.existsSync(lPath)) {
      console.log(`   ❌ ${d}: ic_launcher.png MISSING`);
      allOk = false;
    } else {
      const meta = await sharp(lPath).metadata();
      if (meta.width !== expectedLauncherSizes[d] || meta.height !== expectedLauncherSizes[d]) {
        console.log(`   ❌ ${d}: ic_launcher.png wrong size: ${meta.width}x${meta.height} (expected ${expectedLauncherSizes[d]}x${expectedLauncherSizes[d]})`);
        allOk = false;
      } else {
        console.log(`   ✅ ${d}: ic_launcher.png = ${meta.width}x${meta.height} ✔`);
      }
    }

    // Check round
    const rPath = path.join(mipmapDir, 'ic_launcher_round.png');
    if (!fs.existsSync(rPath)) {
      console.log(`   ❌ ${d}: ic_launcher_round.png MISSING`);
      allOk = false;
    } else {
      const meta = await sharp(rPath).metadata();
      if (meta.width !== expectedLauncherSizes[d] || meta.height !== expectedLauncherSizes[d]) {
        console.log(`   ❌ ${d}: ic_launcher_round.png wrong size: ${meta.width}x${meta.height} (expected ${expectedLauncherSizes[d]}x${expectedLauncherSizes[d]})`);
        allOk = false;
      } else {
        console.log(`   ✅ ${d}: ic_launcher_round.png = ${meta.width}x${meta.height} ✔`);
      }
    }
  }

  // Check background XML
  const bgXmlContent = fs.readFileSync(bgXmlPath, 'utf-8');
  if (bgXmlContent.includes('#004B63')) {
    console.log(`   ✅ ic_launcher_background.xml color = #004B63 ✔`);
  } else {
    console.log(`   ❌ ic_launcher_background.xml color NOT updated`);
    allOk = false;
  }

  if (allOk) {
    console.log('\n🎉 All verifications passed! Adaptive icons are correctly generated.');
  } else {
    console.log('\n⚠️  Some verifications failed. Check the output above.');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
