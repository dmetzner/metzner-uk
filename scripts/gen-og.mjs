// Generates the Open Graph card (og.png, 1200×630) for metzner.uk from an SVG.
// The hub is a dependency-free static repo, so `sharp` isn't installed here.
// Run it borrowing the til-blog sibling's sharp install:
//   NODE_PATH=../til-blog/node_modules node scripts/gen-og.mjs
// Re-run whenever the branding/tagline changes.
import sharp from "sharp";

// rubber duck — same shape as index.html's mascot, scaled up for the card
const duck = `<g transform="translate(905,300) scale(3.6)" filter="url(#ds)">
  <path d="M9 20 L1 16 L4 27 Z" fill="url(#duck)"/>
  <ellipse cx="21" cy="26" rx="15" ry="10.5" fill="url(#duck)"/>
  <circle cx="34" cy="14" r="8.5" fill="url(#duck)"/>
  <path d="M41 11 H49 L46 16.5 H41 Z" fill="#ef8b1f"/>
  <circle cx="35.5" cy="12" r="1.7" fill="#0a0a0f"/>
  <path d="M15 25 q6 6 13 1" fill="none" stroke="#b97f0a" stroke-opacity="0.5" stroke-width="2" stroke-linecap="round"/>
</g>`;

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="uk" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2ee6e6"/><stop offset="1" stop-color="#b06bff"/>
    </linearGradient>
    <linearGradient id="duck" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffe15c"/><stop offset="1" stop-color="#f6b400"/>
    </linearGradient>
    <radialGradient id="g1" cx="10%" cy="8%" r="55%">
      <stop offset="0" stop-color="#2ee6e6" stop-opacity="0.20"/><stop offset="0.6" stop-color="#2ee6e6" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="92%" cy="94%" r="60%">
      <stop offset="0" stop-color="#b06bff" stop-opacity="0.22"/><stop offset="0.6" stop-color="#b06bff" stop-opacity="0"/>
    </radialGradient>
    <filter id="ds" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>
  <rect width="1200" height="630" fill="#070708"/>
  <rect width="1200" height="630" fill="url(#g1)"/>
  <rect width="1200" height="630" fill="url(#g2)"/>
  <text x="90" y="110" font-family="monospace" font-size="28" font-weight="700" letter-spacing="6" fill="#2ee6e6">HTTP 501</text>
  <text x="84" y="320" font-family="sans-serif" font-size="150" font-weight="800" letter-spacing="-4"><tspan fill="#e7e7ea">metzner</tspan><tspan fill="url(#uk)">.uk</tspan></text>
  <text x="90" y="408" font-family="sans-serif" font-size="34" fill="#c2c2cb">Daniel Metzner's hub — portfolio + things I learned.</text>
  <text x="90" y="568" font-family="monospace" font-size="25" font-weight="500"><tspan fill="#e7e7ea">daniel.metzner.uk</tspan><tspan fill="#5e5e69">   ·   </tspan><tspan fill="#e7e7ea">til.metzner.uk</tspan></text>
  ${duck}
</svg>`;

await sharp(Buffer.from(svg)).png().toFile("og.png");
console.log("wrote og.png");
