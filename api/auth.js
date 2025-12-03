import fetch from "node-fetch";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    const { token } = req.query;
    
    // Validate token
    if (!token || token.length < 20) {
      return res.status(400).json({ 
        error: "Valid GitHub token required",
        hint: "Get token from: https://github.com/settings/tokens"
      });
    }
    
    const resp = await fetch("https://api.github.com/user", {
      headers: {
        "Authorization": `token ${token}`,
        "User-Agent": "My-Tool-App"
      }
    });
    
    if (!resp.ok) {
      const errorText = await resp.text();
      return res.status(401).json({ 
        error: "Invalid GitHub Token",
        details: resp.statusText
      });
    }
    
    const data = await resp.json();
    
    // Return only needed info
    return res.json({
      success: true,
      user: {
        login: data.login,
        name: data.name,
        avatar_url: data.avatar_url
      }
    });
    
  } catch (err) {
    console.error("Auth Error:", err.message);
    return res.status(500).json({ 
      error: "Server error",
      message: err.message 
    });
  }
}
