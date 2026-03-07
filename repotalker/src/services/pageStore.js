// RootIB: RB-20260307022444-728ADA47
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "..", "data");
const PAGES_FILE = path.join(DATA_DIR, "pages.json");

async function ensureDataFile() {
  await fs.ensureDir(DATA_DIR);
  if (!(await fs.pathExists(PAGES_FILE))) {
    await fs.writeJson(PAGES_FILE, []);
  }
}

export async function getPages() {
  await ensureDataFile();
  return fs.readJson(PAGES_FILE);
}

export async function savePages(pages) {
  await ensureDataFile();
  await fs.writeJson(PAGES_FILE, pages, { spaces: 2 });
}

export async function getPageById(id) {
  const pages = await getPages();
  return pages.find((p) => p.id === id) || null;
}
