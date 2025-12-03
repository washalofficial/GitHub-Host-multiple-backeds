import fetch from "node-fetch";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    const { token, owner, repo, branch = "main" } = req.query;
    
    if (!token || !owner || !repo) {
      return res.status(400).json({ 
        error: "Missing parameters",
        required: "token, owner, repo"
      });
    }
    
    // Fetch repo info
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
    
    const resp = await fetch(url, {
      headers: {
        "Authorization": `token ${token}`,
        "User-Agent": "My-Tool-App",
        "Accept": "application/vnd.github.v3+json"
      }
    });
    
    if (!resp.ok) {
      const errorData = await resp.json();
      return res.status(resp.status).json({ 
        error: "Cannot fetch repository",
        details: errorData.message || resp.statusText
      });
    }
    
    const data = await resp.json();
    
    // Filter only files (not directories)
    const files = data.tree.filter(item => item.type === "blob");
    
    return res.json({
      success: true,
      branch: branch,
      total_files: files.length,
      files: files.map(file => ({
        path: file.path,
        size: file.size,
        sha: file.sha
      }))
    });
    
  } catch (err) {
    console.error("Repo Error:", err.message);
    return res.status(500).json({ 
      error: "Server error",
      message: err.message 
    });
  }
}
