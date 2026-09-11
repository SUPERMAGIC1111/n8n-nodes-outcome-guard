# Roadmap / Notes

Living notes on where this goes after the free node. Not commitments — just tracked thinking so it isn't lost in chat history.

## Phase 1 — free node (current)

Ship `n8n-nodes-outcome-guard`, get it in front of 5-10 real n8n users, see what they actually ask for next before building anything paid.

## Phase 2 — paid "watchdog" add-on (not started)

The gap: Outcome Guard only checks things *while* a workflow runs. If the whole n8n instance is down, nothing checks anything. A separately-hosted service that independently pings critical workflows/endpoints on a schedule — even when the user's n8n is offline — is real added value, not a paywall on the same feature.

Monetization pattern: free node for distribution (n8n's marketplace), paid hosted service for the watchdog/history/dashboard. This is a proven pattern — see dependency note below.

**Candidate backend: [ScrapeGraphAI](https://github.com/ScrapeGraphAI/Scrapegraph-ai)** (MIT, 30.8k stars as of Sep 2026). If the watchdog ever needs to verify state on a messy webpage rather than a clean API — the exact kind of page that blocked us checking a Lufthansa booking via Cloudflare — this is a stronger fit than hand-written scrapers: describe what you want extracted in plain English, it builds the extraction pipeline. Their own business model (free open-source library + paid cloud API specifically for anti-bot "stealth" handling) is direct proof the free-tool/paid-backend split works at real scale.

**Noted, not chosen:** [agent-reach](https://github.com/Panniantong/agent-reach) (79.4k stars, Feb 2026–Sep 2026 growth) — not directly applicable here (it's built for social/content platforms: Twitter, Reddit, YouTube), but its growth is a strong signal that "reliable AI agent access to the web" is a hot, validated space right now.

## Open questions for Phase 2

- Pricing: subscription vs. usage-based (checks/month)?
- Does the watchdog run checks n8n-side (a scheduled workflow calling out) or fully external or on our own infrastructure?
- Do we need our own anti-bot handling, or lean on ScrapeGraphAI's / a similar paid API for that part specifically?
