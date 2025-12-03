import fetch from 'node-fetch';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // return oauth url
    const state = 'auto-' + Date.now();
    const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo&state=${state}`;
    return res.json({ ok: true, url });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    if (body.type === 'pat') {
      const token = body.token;
      try {
        const r = await fetch('https://api.github.com/user', { headers: { Authorization: `token ${token}` }});
        if (!r.ok) return res.status(401).json({ ok: false });
        const user = await r.json();
        return res.json({ ok: true, user });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false });
      }
    }
    return res.status(400).json({ ok: false, msg: 'invalid' });
  }

  res.status(405).end();
}
