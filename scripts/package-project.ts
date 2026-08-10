import { execSync } from "child_process";
import { existsSync, mkdirSync, statSync } from "fs";
import { resolve } from "path";

const PROJECT_ROOT = resolve(import.meta.dir, "..");
const OUTPUT_DIR = resolve(PROJECT_ROOT, "public", "downloads");
const OUTPUT_FILE = resolve(OUTPUT_DIR, "nabdh-almadina-full.tar.gz");
const ARCHIVE_PREFIX = "nabdh-almadina";

function log(msg: string) {
  console.log(`[package] ${msg}`);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

// ─── Step 1: Create output directory ────────────────────────────────
log("Creating output directory...");
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  log(`  Created: ${OUTPUT_DIR}`);
} else {
  log(`  Exists:  ${OUTPUT_DIR}`);
}

// ─── Step 2: Remove any existing archive ────────────────────────────
if (existsSync(OUTPUT_FILE)) {
  log(`Removing existing archive: ${OUTPUT_FILE}`);
  execSync(`rm -f "${OUTPUT_FILE}"`);
}

// ─── Step 3: Build tar command ──────────────────────────────────────
// Exclusions — directories, files, and glob patterns to skip
const excludes: string[] = [
  // VCS
  ".git",

  // Log files
  "dev.log",
  "server.log",
  "*.log",

  // Agent / AI context
  "agent-ctx",
  ".claude",
  ".z-ai-config",

  // User uploads
  "upload",
  "uploads",

  // Secrets
  ".env",

  // APK files
  "*.apk",

  // Existing archives in project root
  "*.tar.gz",

  // Screenshots
  "screenshot-*.png",
  "screenshot-*.jpg",
  "screenshot-*.jpeg",
  "screenshot-*.webp",

  // React Native / Expo build artifacts in public
  "public/_expo",
  "public/mobile",
  "public/assets",
];

log("Packaging project archive...");
log(`  Project root: ${PROJECT_ROOT}`);
log(`  Output:       ${OUTPUT_FILE}`);
log(`  Archive root: ${ARCHIVE_PREFIX}/`);
log(`  Exclusions:   ${excludes.length} patterns`);

const excludeFlags = excludes.map((e) => `--exclude='${e}'`).join(" \\\n  ");

// Build the tar command.
// -cf instead of -czf because --use-compress-program specifies gzip -9
// --totals prints file count and byte totals at the end
// -v is piped to wc -l via shell to count files without flooding stdout
const tarCommand = [
  "tar",
  "-cf",
  `"${OUTPUT_FILE}"`,
  //
  // Exclusions
  excludeFlags,
  //
  // Prepend nabdh-almadina/ to every path in the archive
  `--transform='s,^,${ARCHIVE_PREFIX}/,'`,
  //
  // Use best compression (gzip level 9)
  "--use-compress-program='gzip -9'",
  //
  // Show total bytes written at the end
  "--totals",
  //
  // Run from project root
  `-C "${PROJECT_ROOT}"`,
  //
  // Archive the current directory
  ".",
].join(" \\\n  ");

try {
  log("Running tar (this may take a few minutes)...");
  const startTime = Date.now();
  const output = execSync(tarCommand, {
    cwd: PROJECT_ROOT,
    maxBuffer: 50 * 1024 * 1024, // 50 MB buffer
    stdio: ["pipe", "pipe", "pipe"],
  });
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`  tar completed in ${elapsed}s`);
  if (output) {
    const lines = output.toString().trim().split("\n").filter(Boolean);
    for (const line of lines) {
      log(`  ${line}`);
    }
  }
} catch (err) {
  console.error("[package] ERROR: tar command failed!");
  console.error(err);
  process.exit(1);
}

// ─── Step 4: Report results ─────────────────────────────────────────
if (existsSync(OUTPUT_FILE)) {
  const stats = statSync(OUTPUT_FILE);
  log("─────────────────────────────────────────────");
  log("Packaging complete!");
  log(`  Archive: ${OUTPUT_FILE}`);
  log(`  Size:    ${formatBytes(stats.size)}`);
  log("─────────────────────────────────────────────");
} else {
  log("ERROR: Archive was not created!");
  process.exit(1);
}
