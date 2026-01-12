const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  try {
    console.log("CodeSentinel AI Code Review Action started");

    const context = github.context;

    // Ensure this action runs only on PRs
    if (!context.payload.pull_request) {
      console.log("No pull request context found. Exiting.");
      return;
    }

    const pullRequest = context.payload.pull_request;
    const prNumber = pullRequest.number;
    const owner = context.repo.owner;
    const repo = context.repo.repo;

    console.log(`PR Number: ${prNumber}`);
    console.log(`Repository: ${owner}/${repo}`);

    // GitHub automatically provides a token to actions
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error("GITHUB_TOKEN not found");
    }

    const octokit = github.getOctokit(token);

    // Fetch changed files in the PR
    const response = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
      per_page: 100,
    });

    console.log(`Files changed in PR: ${response.data.length}`);

    for (const file of response.data) {
      console.log("-----");
      console.log(`File: ${file.filename}`);
      console.log(`Status: ${file.status}`);
      console.log(`Additions: ${file.additions}`);
      console.log(`Deletions: ${file.deletions}`);

      if (file.patch) {
        console.log("Diff:");
        console.log(file.patch);
      } else {
        console.log("Diff not available (binary or large file)");
      }
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();