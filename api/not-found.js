export default function handler(req, res) {
  res.status(404).json({
    error: "Route not found",
    available_routes: [
      "GET /auth?token=YOUR_TOKEN",
      "GET /repo?token=TOKEN&owner=USER&repo=REPO",
      "GET /branch?token=TOKEN&owner=USER&repo=REPO&newBranch=BRANCH_NAME",
      "POST /save (with JSON body)"
    ],
    example_curl: "curl -X GET 'https://your-vercel-app.vercel.app/auth?token=ghp_xxx'"
  });
}
