// Simple script to create basic icon placeholders
const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const createSVGIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="${size * 0.1}" fill="url(#gradient)"/>
    <path d="M${size * 0.5} ${size * 0.2}L${size * 0.2} ${size * 0.35}v${size * 0.3}c0 ${size * 0.17} ${size * 0.12} ${size * 0.3} ${size * 0.3} ${size * 0.34} ${size * 0.18}-${size * 0.04} ${size * 0.3}-${size * 0.17} ${size * 0.3}-${size * 0.34}V${size * 0.35}l-${size * 0.3}-${size * 0.15}z" 
          stroke="white" stroke-width="${size * 0.03}" fill="none"/>
    <path d="M${size * 0.375} ${size * 0.5}l${size * 0.0625} ${size * 0.0625} ${size * 0.125}-${size * 0.125}" 
          stroke="white" stroke-width="${size * 0.03}" fill="none"/>
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#667eea"/>
        <stop offset="100%" style="stop-color:#764ba2"/>
      </linearGradient>
    </defs>
  </svg>`;
};

// Create SVG files
fs.writeFileSync(path.join(__dirname, 'icons', 'icon16.svg'), createSVGIcon(16));
fs.writeFileSync(path.join(__dirname, 'icons', 'icon48.svg'), createSVGIcon(48));
fs.writeFileSync(path.join(__dirname, 'icons', 'icon128.svg'), createSVGIcon(128));

console.log('SVG icons created successfully');