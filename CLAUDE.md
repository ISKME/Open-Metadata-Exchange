# CLAUDE.md — Open Metadata Exchange

Project-level instructions for Claude Code (and any subagent it spawns)
when working in this repository.

## Pull requests

Please follow the pull request related instructions in
[.github/copilot-instructions.md](.github/copilot-instructions.md).

This applies to:

- The top-level Claude Code session.
- Any agent team spawned via the `Agent` tool — delegated agents inherit
  this instruction. When briefing a subagent to open, review, or update
  a PR, explicitly remind it to follow the conventions in
  `.github/copilot-instructions.md`.

## Tests must pass before every commit

Every commit on every PR — whether authored by the top-level Claude
Code session or by a delegated agent — must pass the full test suite
before `git commit` is invoked:

```bash
uv run pytest
```

Do not commit on a red suite. Pre-existing, known-unrelated failures
(for example, tests that need a live NNTP server when one is not
running) must be called out explicitly in the PR description so
reviewers can distinguish them from regressions. When briefing a
subagent to land a change, remind it of this rule.
