import { useState } from 'react';

export default function Deploy(){
  const [repo, setRepo] = useState('');
  const [token, setToken] = useState('');
  const [projectName, setProjectName] = useState('');
  const [platform, setPlatform] = useState('vercel');
  const [status, setStatus] = useState('');

  async function doDeploy(){
    try {
      setStatus('Cloning repo...');
      let r = await fetch('/api/github', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ repoUrl: repo, token })});
      let j = await r.json();
      if (!j.ok) { setStatus('Error cloning: '+(j.err||'')); return; }
      setStatus('Generating live project...');
      let gen = await fetch('/api/generator', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ repoUrl: repo, token, platform, projectName: projectName || 'auto-project' })});
      let gj = await gen.json();
      if (!gj.ok) { setStatus('Error generating: '+(gj.err||'')); return; }
      setStatus('Deploying to platform...');
      let d = await fetch('/api/deploy', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ platform, projectName: projectName || 'auto-project' })});
      let dj = await d.json();
      if (!dj.ok) { setStatus('Deploy error'); return; }
      setStatus('Done! Live at ' + dj.url);
    } catch (err) {
      setStatus('Error: '+err.message);
    }
  }

  return (
    <div style={{maxWidth:900, margin:'40px auto', fontFamily:'Inter, sans-serif'}}>
      <h2>Deploy</h2>
      <input value={repo} onChange={e=>setRepo(e.target.value)} placeholder="https://github.com/owner/repo" style={{width:'100%',padding:8}} />
      <input value={token} onChange={e=>setToken(e.target.value)} placeholder="Personal Access Token (only if not using OAuth)" style={{width:'100%',padding:8, marginTop:8}} />
      <input value={projectName} onChange={e=>setProjectName(e.target.value)} placeholder="Project name (optional)" style={{width:'100%',padding:8, marginTop:8}} />
      <select value={platform} onChange={e=>setPlatform(e.target.value)} style={{width:'100%',padding:8, marginTop:8}}>
        <option value="vercel">Vercel</option>
        <option value="netlify">Netlify</option>
        <option value="cloudflare">Cloudflare</option>
        <option value="supabase">Supabase</option>
      </select>
      <button onClick={doDeploy} style={{marginTop:10,padding:'8px 16px'}}>Deploy Now</button>
      <p style={{marginTop:12}}>{status}</p>
    </div>
  )
}
