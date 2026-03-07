// RootIB: RB-20260307022444-50E92592
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { scanRepoAndUpdateMap } from "./services/repoScanner.js";
import { generateDescriptionsForAll } from "./services/descriptionGenerator.js";
import { generateVideosForAll } from "./services/videoGenerator.js";
import { getPages, getPageById } from "./services/pageStore.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

// Trigger full pipeline: scan -> describe -> video
app.post("/api/pipeline/run", async (req, res) => {
  try {
    await scanRepoAndUpdateMap();
    await generateDescriptionsForAll();
    await generateVideosForAll();
    res.json({ status: "ok", message: "Pipeline completed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Get all pages (metadata + video URLs)
app.get("/api/pages", async (req, res) => {
  try {
    const pages = await getPages();
    res.json(pages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single page by id/path (wildcard to support paths with slashes, e.g. docs/page.md)
app.get("/api/pages/*", async (req, res) => {
  try {
    const page = await getPageById(req.params[0]);
    if (!page) return res.status(404).json({ error: "Not found" });
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`RepoTalker backend running on port ${PORT}`);
});
