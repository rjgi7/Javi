# My Stars ⭐

Installable family reward PWA for a young child.

## What is already implemented

- Kid Tablet mode in simple English.
- Parent Phone mode.
- Daily tasks: child taps **I DID IT!**, parent approves.
- Stars are added only after approval.
- A reward becomes redeemable in the child's interface only when:
  1. every active task for today is approved, and
  2. the child has enough stars.
- Child chooses **REDEEM** or **SAVE MY STARS**.
- Redeeming triggers a large prize celebration with confetti, fireworks and stars.
- Reward history.
- English speech button for task phrases using the tablet/browser voice.
- PWA manifest + service worker + iPad/Android home-screen icons.
- Cloud architecture for phone/tablet sync through Supabase.
- Demo mode when Supabase is not configured.

## Quick local preview

Any static web server works. Example with Python:

```bash
cd public
python -m http.server 8080
```

Open `http://localhost:8080`.

## Enable real Parent Phone ↔ Kid Tablet sync

1. Create a Supabase project.
2. In Supabase, enable **Authentication → Providers → Anonymous Sign-Ins**.
3. Open **SQL Editor** and run `supabase-schema.sql`.
4. In **Project Settings → API**, copy:
   - Project URL
   - anon/public key
5. Put both values in `public/config.js`.
6. Deploy this repository over HTTPS.

### First-time family setup

1. Open the app on the parent's phone.
2. Choose **Parent Phone**.
3. Create/sign in to the parent account.
4. Create the family and enter the child's name.
5. Tap **Generate Pairing Code**.
6. Open the app on the child's tablet and choose **Kid Tablet**.
7. Enter the 6-digit code.

From then on the devices share the same stars/tasks/rewards.

## Install on iPad / iPhone

1. Open the deployed HTTPS URL in Safari.
2. Tap **Share**.
3. Tap **Add to Home Screen**.
4. Name it **My Stars**.
5. Launch it from the new home-screen icon.

It opens in standalone app mode.

## Install on Android tablet

1. Open the HTTPS URL in Chrome.
2. Open the browser menu.
3. Choose **Install app** or **Add to Home screen**.
4. Launch **My Stars** from the home screen.

## Railway

The included `Dockerfile` is ready for Railway. Create a separate GitHub repository for this app, push these files, then deploy that repository on Railway. Railway will build the Nginx container and expose it over HTTPS.

## Important

`SUPABASE_ANON_KEY` is intentionally a browser/public key. Do **not** put a Supabase service-role key, database password, or other secret in `public/config.js`.
