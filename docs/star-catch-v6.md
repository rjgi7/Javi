# My Stars: Star Catch and local daily reset

## Scope
This release belongs only to rjgi7/Javi and the separate Railway my-stars / my-stars-web service. It adds three namespaced files and references in index.html and the PWA cache. The existing app.js, PIN configuration, reward-star accounting, approval logic, music implementation, styles.css, delight-v5 assets, Dockerfile and Nginx configuration are unchanged. No GarleOS repository, service, variables or database were modified.

## Child experience
Play Time appears below the daily tasks. Star Catch unlocks when every active task is approved for the current local calendar day, parent games are enabled, and daily game time remains. No reward-star balance is required. Zero active jobs do not unlock play.

One round lasts 60 seconds, preceded by a three-second countdown. Children tap large illustrated stars, golden stars, hearts and rainbows. Captures have squash-and-stretch reactions, particle bursts, floating scores, a blinking companion that bounces and glides toward the capture, and a rainbow effect. Word breaks ask for an apple and the sun, with visible English labels and optional device speech. Incorrect pictures do not subtract points. Results show a medal, game score, personal best and the unchanged reward-star balance.

Game points NEVER add to or subtract from reward stars. The game reads the family record and stores its own score, best, time budget and recent rounds under separate localStorage keys. It does not sell or redeem rewards.

## Parent controls and play budget
The existing PIN-protected parent dashboard gains an Allow games switch and daily limits of 1, 3, 5 or 10 minutes. The initial limit is five minutes. This is a configurable product default, not health guidance. Play time used is persisted during play and does not refill when the game is closed and reopened. Pausing or hiding the app stops game time. Time renews for each new local day, but completing and approving the new day's active tasks is required to unlock play again.

The local PIN is a child-access guard, not server-side authentication. Budgets are local-device controls, not tamper-proof server enforcement. A browser lock prevents concurrent game sessions where supported, with a local lease fallback. Parent-phone/tablet synchronization remains unimplemented; data and settings are still per device.

## Daily task reset
Before this release, app.js checked the date only on load using an ISO/UTC date. day-guard-v6.js now runs before app.js, records the device-local calendar date and detects local midnight, returning to the foreground, page reopening and interactions after a day change. On rollover it clears completion/approval flags and the pending approval animation, then reloads to rehydrate the existing app. No manual daily reset is needed. A sleeping tablet updates when it wakes or is opened again.

The star balance, reward history, goal, child name, task definitions and ON/OFF choices are preserved. Previous completion flags are archived, bounded to 31 daily entries. All active tasks recur daily; paused tasks stay paused. The game high score and recent round history also persist. Local date/time must be correct on the device.

For compatibility with the unchanged original app module, the legacy day property is refreshed to the UTC label before app loading; calendarDayV6 and myStarsCalendarDayV6 decide the actual local rollover. Legacy records lack exact completion timestamps, so the first migration conservatively preserves progress whose date could be today. A future cloud backend should own the family timezone and authoritative clock.

## Motion, sound and privacy
The game includes an original procedural music-box melody, capture/word/medal effects and a mute control. Audio begins on a play gesture; optional English speech depends on the device's available voice support. Existing app music pauses during the game and is restored on exit when previously enabled. Gentle Motion / prefers-reduced-motion makes targets stationary and suppresses decorative motion. Keyboard controls and focus handling are included.

There are no ads, analytics, purchases, chat, external assets or gameplay network calls.

## Validation and limitations
25 local checks passed: 18 browser/integration-contract checks and 7 calendar checks. Browser checks used the actual shipped addon files in a Chromium fixture with the existing app's relevant DOM and storage contract; they were NOT a full end-to-end test of the live website or original PIN flow. Eight viewports were checked: 320x568, 390x844, 600x960, 768x1024, 900x600, 1024x768, 1280x800 and 844x390.

Checks covered locked/unlocked access, one credit per touch/click, game-only scoring, word answers, pause/resume, round completion, persistent daily budget, parent off, zero active tasks, reduced-motion keyboard input and responsive hit targets. The family record remained byte-for-byte unchanged after a complete game flow. Calendar checks covered UTC midnight vs local midnight, initial migration, new installs, cold opening, DST and bounded archives.

Physical iPad/Android playback and full live-site browser verification are still separate checks. Railway deployment success confirms a running deployment, not those device checks. Clearing browser storage would erase local family progress; the PWA update changes only its named cache and never clears localStorage.
