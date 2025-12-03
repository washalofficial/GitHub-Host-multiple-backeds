const fs = require('fs-extra');
const path = require('path');

const TEMPLATE_ROOT = path.join(process.cwd(), 'templates');

async function copyTemplate(platform, outPath, opts = {}) {
  const tpl = path.join(TEMPLATE_ROOT, `${platform}-template`);
  if (!fs.existsSync(tpl)) throw new Error('Template missing for ' + platform);
  await fs.copy(tpl, outPath);
  // simple placeholder replacement
  if (opts.projectName) {
    const files = await fs.readdir(outPath);
    await Promise.all(files.map(async file => {
      const fp = path.join(outPath, file);
      if ((await fs.stat(fp)).isFile()) {
        let content = await fs.readFile(fp, 'utf8');
        content = content.replace(/__PROJECT_NAME__/g, opts.projectName);
        await fs.writeFile(fp, content, 'utf8');
      }
    }));
  }
}

module.exports = { copyTemplate };
