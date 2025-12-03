import fetch from "node-fetch";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }
  
  try {
    const { token, owner, repo, branch, path, content } = req.body;
    
    if (!token || !owner || !repo || !branch || !path || !content) {
      return res.status(400).json({ 
        error: "Missing parameters",
        required: "token, owner, repo, branch, path, content"
      });
    }
    
    // First, check if file exists to get SHA (for update)
    let sha = null;
    try {
      const checkRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
        {
          headers: {
            "Authorization": `token ${token}`,
            "User-Agent": "My-Tool-App"
          }
        }
      );
      
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        sha = checkData.sha;
      }
    } catch (e) {
      // File doesn't exist, will create new
    }
    
    // Prepare request body
    const bodyData = {
      message: `Update ${path}`,
      content: Buffer.from(content).toString('base64'),
      branch: branch
    };
    
    // Add SHA if updating existing file
    if (sha) {
      bodyData.sha = sha;
    }
    
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const resp = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `token ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "My-Tool-App"
      },
      body: JSON.stringify(bodyData)
    });
    
    const data = await resp.json();
    
    if (!resp.ok) {
      return res.status(resp.status).json({ 
        error: "File upload failed",
        details: data.message
      });
    }
    
    return res.json({
      success: true,
      message: `File saved to ${path}`,
      commit: data.commit.sha,
      url: data.content.html_url
    });
    
  } catch (err) {
    console.error("Save Error:", err.message);
    return res.status(500).json({ 
      error: "Server error",
      message: err.message 
    });
  }
}
