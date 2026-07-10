# SOP: Download CAMS Mutual Fund Statement

## Goal

Get a mutual fund statement that helps calculate capital gains for ITR-2 or ITR-3.

## Before you start

- Keep your PAN ready.
- Use the mobile number or email registered with your mutual fund folios.
- Download statements only from official CAMS, KFintech, MFCentral, or AMC websites.

## CAMS steps

1. Go to the official CAMS investor services website.
2. Choose capital gains / consolidated statement.
3. Enter PAN and registered email/mobile.
4. Select the financial year `FY 2025-26`.
5. Choose statement type that includes purchase date, sale date, units, cost, sale value, STCG, and LTCG.
6. Request the statement by email or download.
7. If the PDF is password protected, note the password format shown by CAMS.
8. Upload the PDF in LastMinute ITR when CAMS parser is live. Until then, use the manual capital gains guide.

## What good looks like

- Statement covers all mutual fund folios.
- It separates short-term and long-term gains.
- It shows equity-oriented funds separately where possible.
- It includes grandfathering or 112A data if applicable.

## Common mistakes

- Downloading only transaction history instead of capital gains statement.
- Selecting the wrong financial year.
- Forgetting KFintech folios when CAMS does not cover all AMCs.
- Entering total redemption value as capital gain.

## In-app use

Once the CAMS connector is live, the AI document pipeline will extract:

- Scheme name
- Purchase and sale dates
- STCG
- LTCG
- 112A equity gains
- Folio-level warnings where confidence is low
