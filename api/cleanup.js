import { cleanupWorkspace } from '../lib/tmpWorkspace';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { path } = req.body || {};
  try {
    cleanupWorkspace(path);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
}
