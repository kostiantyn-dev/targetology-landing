# Telegram lead handler

Google Apps Script backend for the static GitHub Pages site.

Required Script Property:

- `BOT_TOKEN` — Telegram bot token. Never commit it to GitHub.

Setup:

1. Deploy `Code.gs` as a Web app executed as the owner and available to anyone.
2. Add `BOT_TOKEN` in Project Settings → Script Properties.
3. Run `setupWebhook` once and approve the requested permissions.
4. Open `@AlinaSilkaLeadsBot` from the `@SilkaAlina` account and press Start.
5. Add the deployed `/exec` URL to the frontend as its lead endpoint.
