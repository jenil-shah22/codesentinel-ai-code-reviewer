const IGNORED_PATHS = [
  "node_modules/",
  "dist/",
  "package-lock.json",
  "yarn.lock"
];

function shouldIgnoreFile(filename) {
  return IGNORED_PATHS.some(prefix => filename.startsWith(prefix));
}
function runReview(files) {
  const findings = [];

  for (const file of files) {
    const { filename, patch } = file;
    if (shouldIgnoreFile(filename)) {
  continue;
}

    // Skip files without diffs
    if (!patch) continue;

    // Rule 1: console.log in JS/TS files
    if (
      (filename.endsWith(".js") || filename.endsWith(".ts")) &&
      patch.includes("console.log")
    ) {
      findings.push({
        file: filename,
        type: "warning",
        message: "console.log found in code. Remove before production."
      });
    }

    // Rule 2: TODO comments
    if (patch.includes("TODO")) {
      findings.push({
        file: filename,
        type: "info",
        message: "TODO comment found. Ensure it is tracked."
      });
    }

    // Rule 3: Large diff
    const changedLines = patch.split("\n").length;
    if (changedLines > 200) {
      findings.push({
        file: filename,
        type: "warning",
        message: "Large change detected. Consider splitting this PR."
      });
    }
  }

  return findings;
}

module.exports = { runReview };