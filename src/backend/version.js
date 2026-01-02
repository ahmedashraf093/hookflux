const axios = require('axios');
const path = require('path');
const fs = require('fs');

const REPO = "ahmedashraf093/hookflux"; // Correct repository for production

let cachedLatestVersion = null;
let lastChecked = 0;
const CACHE_TTL = 3600000; // 1 hour

function getPkg() {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'));
  } catch (e) {
    return { version: '0.0.0' };
  }
}

async function getLatestVersion(currentVersion) {
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
    return currentVersion;
  }
}

function isNewer(latest, current) {
  const l = latest.replace(/[^0-9.]/g, '').split('.').map(Number);
  const c = current.replace(/[^0-9.]/g, '').split('.').map(Number);
  for (let i = 0; i < Math.max(l.length, c.length); i++) {
    if ((l[i] || 0) > (c[i] || 0)) return true;
    if ((l[i] || 0) < (c[i] || 0)) return false;
  }
  return false;
}

function getVersionInfo(req, res) {
  const currentPkg = getPkg();
  const forceCheck = req.query.force === 'true';
  
  if (forceCheck) {
    cachedLatestVersion = null;
    lastChecked = 0;
  }

  getLatestVersion(currentPkg.version).then(latest => {
    const error = cachedLatestVersion === null && currentPkg.version === latest ? 'Failed to fetch latest version' : null;
    res.json({
      current: currentPkg.version,
      latest: latest,
      updateAvailable: isNewer(latest, currentPkg.version),
      error: error
    });
  }).catch(err => {
    res.json({
      current: currentPkg.version,
      latest: currentPkg.version,
      updateAvailable: false,
      error: err.message
    });
  });
}

module.exports = { getVersionInfo, isNewer };