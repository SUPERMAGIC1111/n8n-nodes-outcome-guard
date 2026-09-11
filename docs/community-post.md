## [Node] Outcome Guard — catch silent failures your Error Trigger doesn't see

Hey all — built a small node this week and figured I'd share it here for feedback before I take it any further.

**The problem it solves:** n8n's Error Trigger only fires when a node actually throws. But a lot of real breakage doesn't look like an error — an API returns HTTP 200 with an error hidden in the body, a filter lets bad data through, a field maps correctly but with the wrong value. The workflow finishes green, nothing downstream happened, and you find out when a customer complains.

**What it does:** drop it in after any step you don't fully trust, tell it what "actually worked" looks like, and it throws a real n8n error if that didn't happen — so it plugs straight into whatever Error Workflow/Slack alerting you already have.

Four check types:
- Field Exists / Not Empty
- Field Equals (with an optional case-insensitive toggle)
- Response Has Hidden Error — scans a body for error indicators even under a 200
- Re-Fetch URL and Check Field — independently re-verifies via a second API call, headers/auth supported

```
npm install n8n-nodes-outcome-guard
```

- npm: https://www.npmjs.com/package/n8n-nodes-outcome-guard
- GitHub: https://github.com/SUPERMAGIC1111/n8n-nodes-outcome-guard

It's early (v0.2.0) — compiles clean, passes n8n's own community-node lint rules, tested, but it hasn't had real-world mileage yet. If you try it, I'd genuinely love to know: does it catch something useful, does it get in the way, is there a check type you wish it had? Bug reports and "this is dumb because X" are just as welcome as praise.

---

## Reddit version (r/n8n) — shorter

**Title:** Made a node that catches the "silent failures" your Error Trigger misses

Ever had a workflow finish green, no errors, and the thing you actually wanted never happened? An API returns HTTP 200 with an error buried in the body, a filter lets through what it shouldn't, a field maps right but with the wrong value — n8n's Error Trigger never sees any of that because nothing technically threw.

Built a node for it: **Outcome Guard**. You put it after a step you don't fully trust, tell it what "actually worked" looks like (a field matches, a response has no hidden error, or an independent follow-up API call confirms the record is really there), and it throws a real error if that check fails — so it feeds straight into whatever alerting you already have.

```
npm install n8n-nodes-outcome-guard
```

npm: https://www.npmjs.com/package/n8n-nodes-outcome-guard
GitHub: https://github.com/SUPERMAGIC1111/n8n-nodes-outcome-guard

Early days (v0.2.0), tested and lint-clean, but no real-world mileage yet — would love feedback, bug reports, or "this is dumb because X" energy, all equally welcome.
