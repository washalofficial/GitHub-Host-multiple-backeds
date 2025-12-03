import fetch from "node-fetch";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    const { token, owner, repo, newBranch } = req.query;
    
    if (!token || !owner || !repo || !newBranch) {
      return res.status(400).json({ 
        error: "Missing parameters",
        required: "token, owner, repo, newBranch"
      });
    }
    
    // Check if branch already exists
    try {
      const checkBranch = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/branches/${newBranch}`,
        {
          headers: {
            "Authorization": `token ${token}`,
            "User-Agent": "My-Tool-App"
          }
        }
      );
      
      if (checkBranch.ok) {
        return res.status(409).json({ 
          error: "Branch already exists",
          branch: newBranch
        });
      }
    } catch (e) {
      // Branch doesn't exist, continue
    }
    
    // Get main branch SHA
    const baseRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/main`,
      {
        headers: {
          "Authorization": `token ${token}`,
          "User-Agent": "My-Tool-App"
        }
      }
    );
    
    if (!baseRes.ok) {
      const errorData = await baseRes.json();
      return res.status(baseRes.status).json({ 
        error: "Cannot fetch base branch",
        details: errorData.message
      });
    }
    
    const baseJson = await baseRes.json();
    
    // Create new branch
    const createRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs`,
      {
        method: "POST",
        headers: {
          "Authorization": `token ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "My-Tool-App"
        },
        body: JSON.stringify({
          ref: `refs/heads/${newBranch}`,
          sha: baseJson.object.sha
        })
      }
    );
    
    const data = await createRes.json();
    
    if (!createRes.ok) {
      return res.status(createRes.status).json({ 
        error: "Branch creation failed",
        details: data.message
      });
    }
    
    return res.json({
      success: true,
      message: `Branch '${newBranch}' created successfully`,
      branch: newBranch,
      sha: data.object.sha
    });
    
  } catch (err) {
    console.error("Branch Error:", err.message);
    return res.status(500).json({ 
      error: "Server error",
      message: err.message 
    });
  }
}
