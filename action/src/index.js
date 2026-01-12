const { runReview } = require("./reviewer/engine");
const { formatReview } = require("./reviewer/formatter");
const core = require("@actions/core");
const github = require("@actions/github");
const { postComment } = require("./github/postComment");


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
      per_page: 100
    });

    console.log(`Files changed in PR: ${response.data.length}`);

// Run rule-based review engine
const findings = runReview(response.data);

// Format findings into a human-readable review
const reviewOutput = formatReview(findings);

// Log review output (next step: post as PR comment)
console.log("----- REVIEW OUTPUT -----");
console.log(reviewOutput);
// Post review as a PR comment
await postComment(
  octokit,
  owner,
  repo,
  prNumber,
  reviewOutput
);


  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
