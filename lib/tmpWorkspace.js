const os = require('os');
const path = require('path');
const fs = require('fs-extra');

function createTempWorkspace(prefix = 'auto-deploy-') {
  const tmpdir = path.join(os.tmpdir(), prefix + Date.now());
  fs.ensureDirSync(tmpdir);
  return tmpdir;
}

function cleanupWorkspace(p) {
  try {
    fs.removeSync(p);
  } catch (err) {
    console.error('cleanup error', err);
  }
}

module.exports = { createTempWorkspace, cleanupWorkspace };
