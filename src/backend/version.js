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
    if (response.data && response.data.tag_name) {
      cachedLatestVersion = response.data.tag_name.replace(/^v/, '');
      lastChecked = now;
      return cachedLatestVersion;
    }
    throw new Error('Invalid response from GitHub');
  } catch (err) {
    console.warn(`[Version Check] Failed to fetch latest version from ${REPO}:`, err.message);
    return pkg.version;
  }
}

function isNewer(latest, current) {
  const l = latest.split('.').map(Number);
  const c = current.split('.').map(Number);
  for (let i = 0; i < Math.max(l.length, c.length); i++) {
    if ((l[i] || 0) > (c[i] || 0)) return true;
    if ((l[i] || 0) < (c[i] || 0)) return false;
  }
  return false;
}

function getVersionInfo(req, res) {
  getLatestVersion().then(latest => {
    const error = cachedLatestVersion === null && pkg.version === latest ? 'Failed to fetch latest version' : null;
    res.json({
      current: pkg.version,
      latest: latest,
      updateAvailable: isNewer(latest, pkg.version),
      error: error
    });
  }).catch(err => {
    res.json({
      current: pkg.version,
      latest: pkg.version,
      updateAvailable: false,
      error: err.message
    });
  });
}

module.exports = { getVersionInfo };
