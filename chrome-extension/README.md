# LastMinute ITR Companion Extension MVP

This is a Manifest V3 helper for the deferred Chrome-extension track.

## What it does

- Runs only on `https://www.incometax.gov.in/*`.
- Highlights a portal field by label when the user asks.
- Never reads PAN, password, OTP, cookies, or submitted return data.
- Never clicks submit or files automatically.

## What it does not do yet

- No auto-fill.
- No screen scraping.
- No server sync.
- No store-ready packaging.

## Local test

1. Open Chrome extensions.
2. Enable developer mode.
3. Load unpacked from `chrome-extension/`.
4. Open the Income Tax portal.
5. Enter a field label in the popup and click highlight.

Keep this MVP separate from the main filing flow until legal and security review signs off.
