// Araya Conscious Chat API
// Netlify Serverless Function - Your AI Ally with Memory
// Uses DeepSeek (primary), Claude Vision (images), OpenAI (fallback)
// NOW WITH CYCLOTRON BRAIN CONNECTION (163k+ atoms)
// NOW WITH NAME EXTRACTION - Araya remembers people by name!
// NOW WITH ABILITIES - Araya can edit files, report bugs, and more!
// NOW WITH CLAUDE VISION - Superior image understanding!
// NOW WITH IMAGE STORAGE - Store and recall images for case building!
// NOW WITH CASE BUILDER - Create cases, timelines, link evidence!

import { createClient } from '@supabase/supabase-js';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = 'overkor-tek';
const GITHUB_REPO = 'consciousness-revolution';
const GITHUB_BRANCH = 'master';
