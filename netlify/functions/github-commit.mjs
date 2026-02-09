// GitHub Commit Function - Enables Araya Self-Editing
// POST: { path, content, message, branch? }
// Returns: { success, sha, url }

import { Octokit } from "@octokit/rest";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "overkor-tek";
const REPO_NAME = "consciousness-revolution";
const DEFAULT_BRANCH = "master";

export const handler = async (event, context) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed. Use POST." })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { path, content, message, branch = DEFAULT_BRANCH } = body;

    // Validate required fields
    if (!path || !content || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Missing required fields",
          required: ["path", "content", "message"],
          optional: ["branch"]
        })
      };
    }

    // Security: Only allow edits within allowed paths
    const allowedPaths = [
      "index.html",
      "araya-chat.html",
      "araya-light.html",
      "araya-welcome.html",
      "ARAYA/",
      "styles/",
      "scripts/",
      "components/"
    ];

    const isAllowed = allowedPaths.some(allowed =>
      path.startsWith(allowed) || path === allowed.replace("/", "")
    );

    if (!isAllowed) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          error: "Path not allowed for self-editing",
          path: path,
          allowedPaths: allowedPaths
        })
      };
    }

    // Initialize Octokit
    const octokit = new Octokit({
      auth: GITHUB_TOKEN
    });

    // Get current file (if exists) to get its SHA
    let currentSha = null;
    try {
      const { data: currentFile } = await octokit.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: path,
        ref: branch
      });
      currentSha = currentFile.sha;
    } catch (e) {
      // File doesn't exist - that's OK, we'll create it
      if (e.status !== 404) {
        throw e;
      }
    }

    // Create or update file
    const { data: commit } = await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: path,
      message: `[ARAYA] ${message}`,
      content: Buffer.from(content).toString("base64"),
      branch: branch,
      ...(currentSha && { sha: currentSha })
    });

    // Success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        action: currentSha ? "updated" : "created",
        path: path,
        sha: commit.content.sha,
        commit_sha: commit.commit.sha,
        commit_url: commit.commit.html_url,
        file_url: commit.content.html_url,
        message: `File ${currentSha ? "updated" : "created"} successfully`,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error("GitHub commit error:", error);

    return {
      statusCode: error.status || 500,
      headers,
      body: JSON.stringify({
        error: "GitHub API error",
        message: error.message,
        status: error.status
      })
    };
  }
};
