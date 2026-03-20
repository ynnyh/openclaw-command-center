# Security Policy

## Supported Scope

This repository is a UI overlay package plus an optional host-side helper.

Security-sensitive areas include:

- helper HTTP/WebSocket exposure
- environment variable handling
- installer output paths
- generated mount/config instructions

## Reporting A Vulnerability

Please do not open a public issue for a suspected security vulnerability.

Instead, report it privately to the repository maintainer through GitHub's private security reporting flow if enabled, or by direct private contact.

When reporting, include:

- affected file(s) or component(s)
- reproduction steps
- impact
- whether the issue requires a running helper, specific host setup, or a browser origin condition

## Response Expectations

Good reports should receive:

- acknowledgement
- severity triage
- a fix or mitigation plan when confirmed

## Safe Defaults

For contributors:

- do not broaden helper origin access casually
- do not expose helper endpoints publicly in examples by default
- do not commit secrets, tokens, or private environment data
- do not assume private filesystem paths in public defaults
