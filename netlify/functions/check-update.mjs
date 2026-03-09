/**
 * check-update.mjs - Version check endpoint for Araya clients
 * Returns current version and update info
 */

// Current production version - UPDATE THIS WHEN DEPLOYING NEW VERSIONS
const CURRENT_VERSION = "2.4.1";
const RELEASE_DATE = "2026-02-25";

// Version history for changelogs
const VERSION_HISTORY = {
  "2.4.1": {
    date: "2026-02-25",
    changes: [
      "Mobile debug panel improvements",
      "Update notification system added",
      "Performance optimizations"
    ]
  },
  "2.4.0": {
    date: "2026-02-24",
    changes: [
      "New conversation memory system",
      "Enhanced AI response formatting",
      "Bug fixes for mobile layout"
    ]
  }
};

export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Parse request - client sends: product, channel, current_version, license_key, hardware_id
    let clientVersion = null;
    let product = 'araya';

    if (event.queryStringParameters?.version) {
      clientVersion = event.queryStringParameters.version;
    } else if (event.body) {
      const body = JSON.parse(event.body);
      clientVersion = body.current_version || body.version;
      product = body.product || 'araya';
    }

    const needsUpdate = clientVersion && compareVersions(clientVersion, CURRENT_VERSION) < 0;
    const isMajorUpdate = needsUpdate && isMajorVersionBump(clientVersion, CURRENT_VERSION);

    // Response format matches what araya-chat.html expects
    const response = {
      success: true,
      update_available: needsUpdate,
      latest_version: CURRENT_VERSION,
      current_version: clientVersion || "unknown",
      download_url: "https://conciousnessrevolution.io/araya-chat.html",
      changelog_url: "https://conciousnessrevolution.io/CHANGELOG.html",
      is_critical: isMajorUpdate,
      release_date: RELEASE_DATE,
      changelog: needsUpdate ? getChangelogSince(clientVersion) : [],
      announcement: null  // Set this for system-wide announcements
    };

    return { statusCode: 200, headers, body: JSON.stringify(response) };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        update_available: false,
        latest_version: CURRENT_VERSION
      })
    };
  }
}

// Check if it's a major version bump (e.g., 2.4.0 to 3.0.0)
function isMajorVersionBump(oldVer, newVer) {
  const oldMajor = parseInt(oldVer.replace(/^v/, '').split('.')[0]) || 0;
  const newMajor = parseInt(newVer.replace(/^v/, '').split('.')[0]) || 0;
  return newMajor > oldMajor;
}

function compareVersions(a, b) {
  const partsA = a.replace(/^v/, '').split('.').map(Number);
  const partsB = b.replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA < numB) return -1;
    if (numA > numB) return 1;
  }
  return 0;
}

function getChangelogSince(clientVersion) {
  const changes = [];
  for (const [version, info] of Object.entries(VERSION_HISTORY)) {
    if (compareVersions(clientVersion, version) < 0) {
      changes.push({ version, date: info.date, changes: info.changes });
    }
  }
  return changes.sort((a, b) => compareVersions(b.version, a.version));
}
