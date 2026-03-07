// RootIB: RB-20260307022444-AF6D5B5C
import axios from "axios";
import { getPages, savePages } from "./pageStore.js";

const GITHUB_API = "https://api.github.com";

function getGitHubConfig() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const missing = ["GITHUB_OWNER", "GITHUB_REPO", "GITHUB_TOKEN"].filter(
    (k) => !process.env[k]
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}`
    );
  }
  return { owner, repo, token };
}

async function listRepoContents(repoPath = "") {
  const { owner, repo, token } = getGitHubConfig();
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${repoPath}`;
  const res = await axios.get(url, {
    headers: { Authorization: `token ${token}` }
  });
  return res.data;
}

async function walkRepo(repoPath = "") {
  const entries = await listRepoContents(repoPath);
  // listRepoContents may return a single file object for a direct path
  let files = [];
  for (const entry of entries) {
    if (entry.type === "dir") {
      const sub = await walkRepo(entry.path);
      files = files.concat(sub);
    } else if (entry.type === "file") {
      files.push(entry);
    }
  }
  return files;
}

function isPageFile(file) {
  const exts = [".md", ".mdx", ".html", ".tsx", ".jsx"];
  return exts.some((ext) => file.name.endsWith(ext));
}

export async function scanRepoAndUpdateMap() {
  const files = await walkRepo("");
  const pageFiles = files.filter(isPageFile);

  const existing = await getPages();
  const existingByPath = new Map(existing.map((p) => [p.path, p]));

  const updated = pageFiles.map((file) => {
    const prev = existingByPath.get(file.path) || {};
    return {
      id: file.path,
      path: file.path,
      name: file.name,
      url: file.html_url,
      type: "page",
      raw_url: file.download_url,
      summary: prev.summary || null,
      enhanced_description: prev.enhanced_description || null,
      script: prev.script || null,
      video_url: prev.video_url || null,
      last_scanned_at: new Date().toISOString()
    };
  });

  await savePages(updated);
  return updated;
}
