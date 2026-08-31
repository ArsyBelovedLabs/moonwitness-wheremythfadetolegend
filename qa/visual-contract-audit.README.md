# Visual contract audit

Run `node qa/visual-contract-audit.mjs` to verify the active public-Web source against the frozen visual/navigation contract. The audit is executed before dependency installation in Observatory E2E so ownership, navigation, frozen-baseline, practice-scope, causality, and four-lens regressions fail early.
