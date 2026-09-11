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
- **Re-Fetch URL and Check Field** — independently call an API afterwards to confirm the record/result actually exists (supports custom headers, so an authenticated API works too — e.g. `Authorization: Bearer ...`)

When a check fails, Outcome Guard throws a real n8n error — which means it plugs straight into your existing Error Workflow / Slack / PagerDuty alerting. No new dashboard to learn.

## Examples

**1. A payment API that hides failures inside a 200 response**

Your HTTP Request node calls a billing API. It returns HTTP 200 no matter what — success or failure is only visible inside the JSON body.

- Check Type: `Response Has Hidden Error`
- Response Body (Expression): `={{ JSON.stringify($json) }}`
- Error Keywords: `error,failed,"success":false,"declined":true`

Now a "successful" HTTP call with a declined payment throws a real n8n error instead of quietly continuing.

**2. Confirming a CRM record actually got created**

Your workflow calls an API to create a contact, but that API is known to occasionally accept the request and silently drop it.

- Check Type: `Re-Fetch URL and Check Field`
- Verification URL: `={{ "https://api.example.com/contacts/" + $json.id }}`
- Headers: `Authorization` → `={{ "Bearer " + $json.accessToken }}` (most real APIs need this — the re-check request supports headers just like the original call would)
- Expected Field Path: `status`
- Expected Field Value: `active`

Outcome Guard makes an independent follow-up call — if the contact isn't really there, it throws before your workflow moves on as if it worked.

**3. A required field that sometimes comes back empty**

A data transform step is supposed to always produce a `customerEmail` field, but occasionally doesn't.

- Check Type: `Field Exists / Not Empty`
- Field (Expression): `={{ $json.customerEmail }}`

## Status

Working prototype: compiles clean, passes n8n's own community-node linter, 5/5 test scenarios pass, and verified live against a running n8n instance. Not yet submitted to the official n8n community node registry — see "Try it right now" below for testing before that.

## Try it right now (no GitHub or npm account needed)

If someone sent you a `n8n-nodes-outcome-guard-0.1.0.tgz` file, you can try this node in your own n8n today:

```bash
mkdir -p ~/.n8n/custom
cd ~/.n8n/custom
npm init -y          # skip if this file already exists
npm install /path/to/n8n-nodes-outcome-guard-0.1.0.tgz
```

Restart n8n. Search for **"Outcome Guard"** when adding a node — it'll be there.

Found something confusing, a bug, or a check type you wish existed? That feedback is exactly what this early stage needs — say so.

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
