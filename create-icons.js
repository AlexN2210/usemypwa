const fs = require('fs');
const path = require('path');

// Créer des icônes PNG simples en base64
const createPNGIcon = (size) => {
  // Icône simple avec un cercle bleu et un checkmark blanc
  const canvas = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size/8}" fill="#3b82f6"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size/4}" fill="white"/>
  <path d="M${size*0.35} ${size/2}L${size*0.45} ${size*0.6}L${size*0.65} ${size*0.4}" stroke="#3b82f6" stroke-width="${size/20}" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
  
  return canvas;
};

// Créer les fichiers SVG temporaires
fs.writeFileSync('public/icon-192.svg', createPNGIcon(192));
fs.writeFileSync('public/icon-512.svg', createPNGIcon(512));

console.log('Icônes SVG créées. Vous devez les convertir en PNG manuellement ou utiliser un outil en ligne.');
console.log('Recommandation: Utilisez https://convertio.co/svg-png/ pour convertir les SVG en PNG');
