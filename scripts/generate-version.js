// This script generates src/version.js with version and build time info from meta.json
const fs = require('fs');
const path = require('path');

// Read version from meta.json (same as used by cache buster)
const metaPath = path.join(__dirname, '../public/meta.json');
let version;

try {
  const metaContent = fs.readFileSync(metaPath, 'utf8');
  const meta = JSON.parse(metaContent);
  version = meta.version;
  console.log(`📦 Using version from meta.json: ${version}`);
} catch (error) {
  console.error('❌ Error reading meta.json:', error.message);
  console.log('📦 Falling back to package.json version...');
  
  // Fallback to package.json if meta.json doesn't exist
  const pkg = require('../package.json');
  version = pkg.version;
}

const buildTime = new Date().toISOString();

const content = `// This file is auto-generated during build. Do not edit manually.
module.exports = {
  version: "${version}",
  buildTime: "${buildTime}"
};
`;

fs.writeFileSync(path.join(__dirname, '../src/version.js'), content);
console.log('Generated src/version.js with version', version, 'and build time', buildTime); 