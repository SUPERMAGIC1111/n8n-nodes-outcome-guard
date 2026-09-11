# Publishing checklist

Everything code-side is done and verified (see CHANGELOG.md). What's left needs your own GitHub and npm accounts — I can't create accounts or log in on your behalf, so these are the exact steps for whenever you're ready. Nothing here needs guesswork; just follow in order.

## 1. Create the GitHub repo

1. Go to github.com → New repository → name it `n8n-nodes-outcome-guard` → Public → **don't** initialize with a README (we already have one)
2. Copy the repo URL it gives you (looks like `https://github.com/<you>/n8n-nodes-outcome-guard.git`)
3. Run:
   ```bash
   cd ~/Documents/AIAIAI-----AI/n8n-outcome-guard
   git remote add origin <paste-the-URL-here>
   git push -u origin main
   ```
4. Update `package.json`'s `"repository"` and `"homepage"` fields with the real URL (currently left blank on purpose — see the commit history, we didn't want to fake a link that didn't exist yet)

## 2. Create an npm account (if you don't have one)

npmjs.com → Sign Up. Free.

## 3. Publish to npm

```bash
cd ~/Documents/AIAIAI-----AI/n8n-outcome-guard
npm login          # follow the prompts — this is interactive, I can't do it for you
npm publish
```

## 4. Submit for n8n community node verification (optional but recommended)

Once it's live on npm, n8n has a verification process so it shows up as a trusted "Verified" node in-app: https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/ — follow their current submission form; the technical requirements (no runtime dependencies, passes their linter, has a README) are already satisfied.

## Before any of the above: get real feedback first

You don't need any of steps 1-4 to start getting real users. Anyone with n8n can already install `n8n-nodes-outcome-guard-0.2.0.tgz` today — see the "Try it right now" section in README.md. That's the faster, free way to find out if this is actually useful before spending time on the publishing steps.
