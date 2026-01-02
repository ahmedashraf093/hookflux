const axios = require('axios');
const path = require('path');
const fs = require('fs');

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'));
const REPO = "ahmedashraf093/hookflux"; // Correct repository for production

let cachedLatestVersion = null;
let lastChecked = 0;
const CACHE_TTL = 3600000; // 1 hour

async function getLatestVersion() {
  const now = Date.now();
  if (cachedLatestVersion && (now - lastChecked < CACHE_TTL)) {
    return cachedLatestVersion;
  }

  try {
    const response = await axios.get(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { 'User-Agent': 'HookFlux-Version-Check' },
      timeout: 5000
    });
    cachedLatestVersion = response.data.tag_name.replace(/^v/, '');
    lastChecked = now;
    return cachedLatestVersion;
  } catch (err) {
    console.warn('[Version Check] Failed to fetch latest version:', err.message);
    return pkg.version; // Fallback to current version
  }
}

function getVersionInfo(req, res) {
  getLatestVersion().then(latest => {
    res.json({
      current: pkg.version,
      latest: latest,
      updateAvailable: latest !== pkg.version
    });
  }).catch(err => {
    res.json({
      current: pkg.version,
      latest: pkg.version,
      updateAvailable: false
    });
  });
}

module.exports = { getVersionInfo };
