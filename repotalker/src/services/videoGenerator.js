// RootIB: RB-20260307022444-CEFF4D56
import axios from "axios";
import { getPages, savePages } from "./pageStore.js";

/**
 * Call a text-to-video / talking-head API with the narration script.
 *
 * Adjust the payload shape to match your chosen provider:
 *   - Sora: https://platform.openai.com/docs/api-reference/video
 *   - D-ID: https://docs.d-id.com/reference/create-a-talk
 *   - HeyGen: https://docs.heygen.com/reference/create-video-v2
 *
 * @param {{ script: string, pageId: string }} param0
 * @returns {Promise<string>} public URL of the generated video
 */
async function requestTalkingHeadVideo({ script, pageId, VIDEO_API_URL, VIDEO_API_KEY }) {
  const payload = {
    script,
    avatar: "default_guide",
    voice: "friendly",
    aspect_ratio: "16:9",
    metadata: { pageId }
  };

  const res = await axios.post(VIDEO_API_URL, payload, {
    headers: {
      Authorization: `Bearer ${VIDEO_API_KEY}`,
      "Content-Type": "application/json"
    }
  });

  // Provider is expected to return { video_url: "https://..." }
  return res.data.video_url;
}

export async function generateVideosForAll() {
  // Validate required env vars once before processing any pages
  const missing = ["VIDEO_API_URL", "VIDEO_API_KEY"].filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}`
    );
  }

  const VIDEO_API_URL = process.env.VIDEO_API_URL;
  const VIDEO_API_KEY = process.env.VIDEO_API_KEY;

  const pages = await getPages();
  const updated = [];

  for (const page of pages) {
    // Skip pages with no narration script
    if (!page.script) {
      updated.push(page);
      continue;
    }

    // Skip pages that already have a video
    if (page.video_url) {
      updated.push(page);
      continue;
    }

    try {
      const video_url = await requestTalkingHeadVideo({
        script: page.script,
        pageId: page.id,
        VIDEO_API_URL,
        VIDEO_API_KEY
      });

      updated.push({
        ...page,
        video_url,
        last_video_generated_at: new Date().toISOString()
      });
    } catch (err) {
      console.error(`[videoGenerator] Skipping ${page.id}: ${err.message}`);
      updated.push(page);
    }
  }

  await savePages(updated);
  return updated;
}
