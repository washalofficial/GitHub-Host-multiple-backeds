import { createTempWorkspace, cleanupWorkspace } from '../lib/tmpWorkspace';
import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs-extra';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { repoUrl, token } = req.body || {};
  if (!repoUrl || !token) return res.status(400).json({ ok: false, err: 'repoUrl+token required' });

  const tmp = createTempWorkspace();
  try {
    const authUrl = repoUrl.replace('https://', `https://${token}@`);
    const git = simpleGit(tmp);
    await git.clone(authUrl, tmp, ['--depth', '1']);
    // create live-deploy branch
    await git.checkoutLocalBranch('live-deploy');
    // create SAFETY_NOTE
    await fs.outputFile(path.join(tmp, 'SAFETY_NOTE.txt'), 'This is an auto-generated live-deploy branch. Original repo untouched.');
    await git.add('.');
    await git.commit('Create live-deploy scaffold');
    await git.push('origin', 'live-deploy', ['-u']);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, err: err.message });
  } finally {
    cleanupWorkspace(tmp);
  }
}
