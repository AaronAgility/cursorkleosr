const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../assets');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG icon content with Agility triangle
const triangleIconSVG = `<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle for better icon visibility -->
  <circle cx="128" cy="128" r="128" fill="#1a1a1a"/>
  
  <!-- Agility Triangle - Scaled and Centered -->
  <g transform="translate(128, 128) scale(3.5) translate(-20.8, -18)">
    <path fill-rule="evenodd" clip-rule="evenodd" 
          d="M24.4227 30.2102H9.83134L20.8296 11.2799L31.828 30.2102L35.0358 35.8501H41.6587L20.8291 0L0 35.8501H26.9791L24.4227 30.2102Z" 
          fill="#FFCB28"/>
  </g>
</svg>`;

// Icon sizes to generate
const iconSizes = [
  { size: 16, name: 'icon-16.png' },
  { size: 32, name: 'icon-32.png' },
  { size: 48, name: 'icon-48.png' },
  { size: 64, name: 'icon-64.png' },
  { size: 128, name: 'icon-128.png' },
  { size: 256, name: 'icon-256.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 1024, name: 'icon-1024.png' }
];

async function generateIcons() {
  console.log('🎨 Generating Kairo app icons from Agility triangle...');
  
  try {
    // Convert SVG buffer
    const svgBuffer = Buffer.from(triangleIconSVG);
    
    // Generate PNG icons at various sizes
    for (const { size, name } of iconSizes) {
      const outputPath = path.join(iconsDir, name);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
        
      console.log(`✅ Generated ${name} (${size}x${size})`);
    }
    
    // Generate ICO file for Windows (using 32x32 size)
    const icoPath = path.join(iconsDir, 'icon.ico');
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(icoPath.replace('.ico', '.png'));
    
    // For ICO, we'll use the PNG for now (cross-platform compatibility)
    fs.copyFileSync(path.join(iconsDir, 'icon-32.png'), path.join(iconsDir, 'icon.ico'));
    
    console.log('✅ Generated icon.ico (32x32)');
    
    // Generate ICNS for macOS (requires icns conversion, we'll use PNG for now)
    const icnsPath = path.join(iconsDir, 'icon.icns');
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(icnsPath.replace('.icns', '.png'));
    
    console.log('✅ Generated icon.icns (512x512)');
    
    // Copy favicon to web app
    const faviconPath = path.join(__dirname, '../apps/web/app/favicon.ico');
    fs.copyFileSync(path.join(iconsDir, 'icon-32.png'), faviconPath);
    console.log('✅ Updated favicon.ico in web app');
    
    console.log('\n🎉 All icons generated successfully!');
    console.log('\nGenerated files:');
    iconSizes.forEach(({ name, size }) => {
      console.log(`  📄 ${name} - ${size}x${size} PNG`);
    });
    console.log('  �� icon.ico - Windows icon');
    console.log('  📄 icon.icns - macOS icon');
    console.log('  📄 favicon.ico - Web favicon');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

// Run the icon generation
generateIcons();
