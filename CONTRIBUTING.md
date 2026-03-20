# Contributing

Thanks for contributing to OpenClaw Command Center.

## Scope

This repository is an overlay package for an existing OpenClaw deployment.

Good contributions include:

- installer fixes
- overlay UI fixes
- helper diagnostics improvements
- documentation fixes
- compatibility clarifications
- smoke-test coverage improvements

Changes that need extra care:

- anything that changes the install/output contract
- anything that assumes a specific private environment
- anything that redistributes upstream OpenClaw runtime assets
- anything that bundles product screenshots or other assets without clear redistribution rights

## Before You Open A PR

Please check:

1. the change still matches the "overlay package" positioning
2. the change does not turn the repository into a standalone app or backend replacement
3. no private paths, tokens, screenshots, or environment-specific assumptions are introduced
4. the generated filenames and mount paths stay consistent

## Local Checks

Run the lightweight checks before opening a PR:

```powershell
node --check scripts\command-center-helper.mjs
node --check scripts\smoke-check.mjs
node --check shell\mission-control-shell.js
node --check shell\mission-control-overview.js
node scripts\smoke-check.mjs
```

If you have Bash available, also run:

```bash
bash -n install.sh
```

## Pull Request Guidelines

- Keep PRs focused.
- Explain the user-facing impact.
- Mention any installer/output contract changes explicitly.
- Update docs when behavior changes.
- Add or adjust smoke checks when practical.

## Assets And Licensing

Do not add:

- upstream runtime chunks committed into source control unless redistribution is confirmed
- product screenshots unless redistribution rights are clear
- private environment paths as defaults in public-facing docs or code

## Reporting Gaps

If you are unsure whether a change belongs here, open an issue first and describe:

- the current behavior
- the desired behavior
- whether it affects install output, helper behavior, or the overlay UI
