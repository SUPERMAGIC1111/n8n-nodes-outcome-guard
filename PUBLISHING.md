# Publishing checklist

## 1. GitHub repo — done ✅

Live at https://github.com/SUPERMAGIC1111/n8n-nodes-outcome-guard — full history, MIT license detected, `package.json` updated with the real URL. Pushed via a dedicated SSH deploy key (`outcome-guard-deploy` in your GitHub SSH keys settings) so future pushes need no password/token at all.

## 2. npm account — done ✅

## 3. Published to npm — done ✅

**Live at https://www.npmjs.com/package/n8n-nodes-outcome-guard** — `n8n-nodes-outcome-guard@0.2.0`, published 2026-09-11. Anyone running n8n can now install it with `npm install n8n-nodes-outcome-guard` in their `~/.n8n/custom` folder, no `.tgz` file needed anymore.

## 4. Submit for n8n community node verification (optional but recommended)

Once it's live on npm, n8n has a verification process so it shows up as a trusted "Verified" node in-app: https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/ — follow their current submission form; the technical requirements (no runtime dependencies, passes their linter, has a README) are already satisfied.

## Before any of the above: get real feedback first

You don't need any of steps 1-4 to start getting real users. Anyone with n8n can already install `n8n-nodes-outcome-guard-0.2.0.tgz` today — see the "Try it right now" section in README.md. That's the faster, free way to find out if this is actually useful before spending time on the publishing steps.
