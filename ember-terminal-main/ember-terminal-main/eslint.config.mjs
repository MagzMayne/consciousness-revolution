/** SIGNED BY MeRLynn - ID: MERLYNN-5f946bc9 - TIMESTAMP: 2025-12-19T05:53:06.515Z - HASH: 377b3645 */
/** SIGNED BY AGentR - ID: AGENTR-308230ea - TIMESTAMP: 2025-12-19T05:53:06.515Z - HASH: 377b3645 */

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
