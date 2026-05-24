# Trust Transaction Monitoring Demo

Static HTML demo for a trust-firm transaction monitoring scenario in Aruba.

The demo is designed for live presentations where the client needs to see how a monitoring dashboard can identify, review, and package transactions that may be reportable to FIU Aruba.

## Current demo focus

- Trust-firm client monitoring
- AWG / Afl. transaction values
- FIU objective indicator logic for giro / cashless transfers of Afl. 500,000 or more
- Manual MLCO-style review workflow
- Simulated FIU report package preparation
- Rule Manager simulation
- Transaction search, filters, CSV export, and dashboard views

## Files

- `index.html` — self-contained dashboard simulator
- `docs/demo-script.md` — recommended live-demo walkthrough
- `CHANGELOG.md` — version history and refinement log

## Running locally

Open `index.html` directly in a browser.

No backend, API key, database, CDN, or internet connection is required.

## Important disclaimer

This is a simulator for demonstration purposes only. It does not submit reports to FIU Aruba, does not connect to Fraugster, and does not process real client data.

Do not upload or enter real client-identifying information into the demo unless the application is later hardened, access-controlled, and reviewed for privacy, security, and regulatory requirements.

## Recommended next refinements

- Add AXIOMA branding and logo treatment
- Add a formal demo mode for trust offices
- Add a separate casino/objective-indicator demo mode
- Add mock FIU XML/CSV export
- Add downloadable review memo/package
- Add configurable indicators per sector
