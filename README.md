# n8n-nodes-outcome-guard

Catch **silent failures** in n8n workflows — the ones where every node reports "success" but the real-world outcome never actually happened.

## The problem

n8n's built-in Error Trigger only fires when a node throws an actual error. But a lot of real breakage doesn't look like an error:

- An API returns HTTP 200 with an error message *inside* the response body.
- A filter node lets through a record it shouldn't.
- A field maps to the right place with the wrong value.

Your workflow finishes green. Nothing downstream happened. You find out when a customer complains.

## What this node does

Drop **Outcome Guard** in after any step you don't fully trust. Tell it what "actually worked" looks like:

- **Field Exists / Not Empty** — fail if an expected field is missing or blank
- **Field Equals** — fail if a field doesn't match what you expected
- **Response Has Hidden Error** — scan a response body for error keywords even when the HTTP status looked fine
- **Re-Fetch URL and Check Field** — independently call an API afterwards to confirm the record/result actually exists

When a check fails, Outcome Guard throws a real n8n error — which means it plugs straight into your existing Error Workflow / Slack / PagerDuty alerting. No new dashboard to learn.

## Status

Early prototype. Core logic implemented and type-checked. Not yet published to the n8n community node registry.

## Local development

```bash
npm install
npm run build
```

To test inside a local n8n instance, symlink this package into n8n's custom extensions:

```bash
npm link
cd ~/.n8n/custom   # create if it doesn't exist
npm link n8n-nodes-outcome-guard
```

Then restart n8n — "Outcome Guard" should appear in the nodes panel.
