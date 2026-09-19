# My Stars: parent rewards and reversible limits (v7)

## Scope
Only rjgi7/Javi and its existing, separate Railway my-stars/my-stars-web service. Adds public/parents-v7.js and public/parents-v7.css plus their index.html and service-worker references. No modifications to app.js, the existing PIN, task approvals, daily rollover, Star Catch source, music, infrastructure, secrets or any GarleOS resource.

## Where to find it
Enter the existing PIN-protected Parents dashboard. The new Rewards & Guidance card provides Manage rewards, Adjust stars, A fresh start, Reset test rewards, and Undo last parent change. Forms are dialog panels with focus handling, clear labels and touch-sized controls.

## Reward catalog
Parents can create and edit rewards with a short name, integer star cost from 1 to 9999 and a built-in picture (ice cream, movie, toy, gift, book or star). Active rewards are sorted by price. SVG artwork is used for custom rewards in the shop, goal, roadmap and claims. Hiding a reward moves it into Hidden rewards; Restore returns it to the shop. At least one active reward is retained because the existing app requires a goal. The active catalog is limited to 20 entries. Existing claims retain their historic names/costs; editing or hiding rewards does not refund spent stars. The child still claims rewards through the existing approval and balance rules.

## Star adjustments
Add or remove a chosen whole number of reward stars with a parent-only note. A preview and explicit confirmation precede deductions. Negative balances are rejected. These adjustments do not clear daily tasks, approvals, rewards or game records. No automatic deduction for behavior is introduced.

## A fresh start
A parent can choose a 5, 10 or 15 minute pause for games, claiming prizes, or both. The options are configurable product controls, not clinical guidance. The pause expires by the local device clock, or the parent can use Give a fresh start now to end it early. The child sees Let's try again, a small next step (Talk with Mom, Use kind words or Help tidy up), and Your stars are safe. Tasks and saving remain available. No extra stars are given for ending the pause and none are removed by the pause.

UI gates cover game entry, start, resume/replay, prize-claim buttons and an already-open claim confirmation. A running game uses its existing Pause control. Game-score and daily-play-budget storage are never written by this addon. The base game and app are unchanged. These remain local child-access controls, not server-side or tamper-proof authentication.

## Reset is explicit, not a deployment side effect
No user data is reset on installation or update. Actual family data is local to the user's browser/tablet and is not accessible to the assistant through GitHub or Railway. The parent must perform the desired reset on that device.

Clear reward claims empties history without refunding spent stars. An unchecked-by-default Also set reward stars to 0 option permits a separate, explicitly confirmed balance reset. Tasks, approvals, routine settings and game scores remain intact. Claim-derived sticker counts may change when history is cleared.

Restore example rewards returns Ice Cream 20, Movie Night 35, Small Toy 50 and Big Surprise 75. Custom created rewards are retained under Hidden rewards. The star balance and claim history are not changed by restoring this catalog.

## Undo and persistence
The most recent parent change records before/after values for only its affected fields. Undo restores those fields only if they still match the saved after-state, refusing to overwrite newer changes. Parent notes/events are retained locally, bounded to 60 events. Save failures are surfaced. Mutations reload the app after saving to rehydrate its existing module state. Other same-origin tabs reload on family changes to reduce stale-state overwrites. This is not cross-device synchronization or a database transaction.

## Validation and limitations
29 Chromium local component/contract checks passed, including no implicit reset, parent access checks, add/edit/hide/restore, balance floor, cancel, undo/conflict protection, all three pause scopes, timed expiry, active-game pause control, stale claim confirmation, explicit resets, escaped reward names and storage-failure handling. Layouts were checked at 320x568, 390x844, 768x1024, 1024x768 and 1280x800.

The browser environment blocks website navigation, including localhost. Tests therefore used about:blank with an in-memory Storage implementation and a rehydration stand-in for location.reload, with selectors and data contracts checked against the current repository. These are NOT full live-site, real-origin persistence, original PIN-flow or physical-tablet tests. The JavaScript blob sent to GitHub matches the locally tested source hash. Deployment success is checked separately.

Phone/tablet cloud sync remains unimplemented. Changes must be made on the device holding the child's progress. Do not clear browser storage to refresh the PWA. The service-worker change replaces only named caches, not family progress.
