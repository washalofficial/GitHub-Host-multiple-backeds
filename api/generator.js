import { copyTemplate } from '../lib/platformTemplates';
import { createTempWorkspace, cleanupWorkspace } from '../lib/tmpWorkspace';
import path from 'path';
import fs from 'fs-extra';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { repoUrl, token, platform='vercel', projectName='auto-project' } = req.body || {};
  const tmp = createTempWorkspace();
  try {
    // For now: copy template for platform into tmp/out
    const out = path.join(tmp, 'out');
    await copyTemplate(platform, out, { projectName });
    // simple zip of out for debugging
    res.json({ ok: true, path: out });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, err: err.message });
  } finally {
    // do not cleanup so frontend can fetch artifact if needed
    // cleanupWorkspace(tmp);
  }
}
