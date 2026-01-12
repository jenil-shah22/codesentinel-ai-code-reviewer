const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  try {
    console.log("CodeSentinel AI Code Review Action started");

    const context = github.context;

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

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error("GITHUB_TOKEN not found");
    }

    const octokit = github.getOctokit(token);

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
      if (file.patch) {
        console.log(file.patch);
      }
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
