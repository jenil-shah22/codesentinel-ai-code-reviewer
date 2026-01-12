function formatReview(findings) {
  if (!findings || findings.length === 0) {
    return (
      "✅ **Automated Code Review Result**\n\n" +
      "No issues found. The changes look good."
    );
  }

  let output = "🧠 **Automated Code Review**\n\n";

  const groupedByFile = {};

  // Group findings by file
  for (const finding of findings) {
    if (!groupedByFile[finding.file]) {
      groupedByFile[finding.file] = [];
    }
    groupedByFile[finding.file].push(finding);
  }

  // Build readable output
  for (const fileName of Object.keys(groupedByFile)) {
    output += `### 📄 ${fileName}\n`;

    for (const item of groupedByFile[fileName]) {
      let icon = "❗";
      if (item.type === "warning") icon = "⚠️";
      if (item.type === "info") icon = "ℹ️";

      output += `- ${icon} ${item.message}\n`;
    }

    output += "\n";
  }

  return output;
}

module.exports = { formatReview };  