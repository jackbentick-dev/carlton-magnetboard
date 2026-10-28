# Carlton Magnetboard

A personal, fan-built Carlton FC (AFL) season hub. It is a magnet-board team selector plus Best & Fairest voting, match stats, fixture/results and list tracking. It's a hobby project for one user (Jack, a Carlton fan), so polish and correctness matter more than scale. It runs as a static page, opened from disk (`file://`) on the Mac and from **GitHub Pages** on the phone: `https://jackbentick-dev.github.io/carlton-magnetboard/carlton-magnetboard.html` (repo `jackbentick-dev/carlton-magnetboard`, served from `main`). The phone only sees what's been pushed. There is no server and no bundler at runtime. Each device keeps its own localStorage. **B&F votes sync between devices** through a private GitHub gist (see Vote sync). Boards and ratings don't sync; use Backup → Restore for those.

## Files

| File | What it is | Edit? |
|---|---|---|
| `carlton-magnetboard.html` | Shell: phone/desktop detection script, fonts, React 18 UMD from cdnjs, global CSS/keyframes, then `<script src="data.js">` and `<script src="app.js">` | Rarely |
| `data.js` | **All season data** as plain-JS globals. Weekly updates touch only this file | Yes, often |
| `app.src.jsx` | **App source** (React, inline styles, no imports, uses globals from data.js) | Yes, for features |
| `app.js` | Compiled output of `app.src.jsx`. **Generated: never hand-edit** | No, rebuild it |
| `get_photos.py` | Optional: downloads official headshots into `players/<number>.png` for offline use | Rarely |
| `scripts/build.js`, `scripts/smoke.js`, `package.json` | Build + headless render test | As needed |

`data.js` and `app.js` share one global scope through classic `<script>` tags. Top-level `const` in data.js is visible to app.js. Don't convert either file to an ES module without changing both.

## Commands

```bash
npm install          # first time only: @babel/core, @babel/preset-react, jsdom, react, react-dom
npm run build        # app.src.jsx -> app.js (Babel, classic JSX runtime)
npm test             # node --check both files + headless jsdom render of 2026 and 2027, desktop and mobile
```

**After any change to `app.src.jsx`, run `npm run build && npm test`.** For data-only changes, run `npm test`. To view the board, open `carlton-magnetboard.html` in a browser.

Jack's Mac had **no Node.js** as at 26 Oct 2026, so `npm` fails there until Node is installed (nodejs.org installer). Without it, the 26 Oct build was done by running Babel standalone 7.23.5 in a browser on `app.src.jsx` with `presets: [['react', { runtime: 'classic', useSpread: true }]]` and `generatorOpts: { jsescOption: { minimal: true } }`. That matches the Node build byte-for-byte except one space. Then the page was clicked through in both seasons by hand. Prefer the real `npm` path once Node exists.

## Architecture

### Globals in data.js (in file order)
- `CARLTON_PLAYERS`: the 2026 46-man list `{ id, number, name, height, dob, position: DEF|MID|RUCK|FWD, captain?, recruit?, aflId }`. Player identity across the app = `name` (stats join on exact name) and `id` (votes/board keyed by id). The early AI draft had wrong heights/DOBs for 36 players. On 27 Oct 2026, numbers, heights, DOBs and `aflId` (real Champion Data id `CD_I<n>`, the same number as the photo id) were reset from the official AFL squad API: `https://aflapi.afl.com.au/afl/v2/squads?teamId=5&compSeasonId=85` (Carlton = team 5; 2026 = compSeason 85, 2027 = 102). Use that for any new or changed player. Positions are the board's own call, because the API's are often stale (it lists McGovern as a key forward). Where they disagreed, 2026 Wheelo role stats decided: CBA %, ruck contests, kick-ins, intercepts, shots. Ollie Hollands (DEF) and Cerra (MID) were left as is; their stats were mixed.
- `FIXTURE_2026`: `{ round, date, time, opponent, venue, home, tag?, played? }`. Byes are `opponent: 'BYE'` (R2, R14). Opponent names must match `AFL_CLUBS` keys.
- `AFL_CLUBS`, `CLUB_LOGO_FILES`: colours/abbrevs, and Squiggle logo filenames.
- `PLAYER_PHOTOS`: jersey number → official AFL CDN headshot URL (`s.afl.com.au/.../ChampIDImages/AFL/2026014/<photoId>.png`).
- `BF_HISTORY`: Carlton B&F totals 2016–2025 (2022 missing).
- `MATCH_STATS`: `{ OR: { opponent, venue, players: [{ name, rating, tog, k, hb, d, de, mg, i50, cp, gb, m, im, cm, sg, g, b, xs, xsr, ga, si, tk, pa, ho, epc, epoc, ep, ebu }] }, R1: …, … }`.
- `STAT_CATEGORIES`: Stats-tab groupings of those keys.
- `CSV_OR`…`CSV_R26` + `buildSeedRatings()`: per-round `{ 'Player Name': { rating, tog } }` maps. These seed the B&F vote screen (keyed by player id).
- `RESULTS_2026`: `{ R1: { for, against, result: 'W'|'L'|'D' } }`, Carlton's score first.
- `SQUIGGLE_NAMES`: Squiggle → board names (`'Greater Western Sydney'→'GWS'`, `'Brisbane Lions'→'Brisbane'`).
- **2027 block:** `LIST_CHANGES_2027 = { asAt, out: [{ name, how, date, note? }], in: [full player records + how/from/note], pending: [{ what, note }] }`. `CARLTON_PLAYERS_2027` is **derived** (2026 list minus `out`, plus `in`). Edit `LIST_CHANGES_2027`, never the derived list. `FIXTURE_2027`, `RESULTS_2027` and `MATCH_STATS_2027` are empty until the AFL releases the fixture.
- `SEASONS`: registry `{ 2026: { year, players, fixture, results, stats, seeds, seedKey, listChanges }, 2027: … }`.

### Season switching (app.src.jsx)
- The top of app.src.jsx declares module-level `let S_YEAR, S_PLAYERS, S_FIXTURE, S_RESULTS, S_STATS, S_SEEDS, S_SEED_KEY, S_LIST` and `applySeason(y)`. **All components read these `S_*` vars, never `CARLTON_PLAYERS`/`FIXTURE_2026` directly.**
- `Root` holds the selected year (persisted in `localStorage['carlton-season']`, default `'2027'`), calls `applySeason(year)` on render, and renders `<App key={year} />` (or `<MobileApp key={year} />` on phones). The key change remounts the whole tree, so all `useState` initialisers re-run against the new season. That remount is what keeps the module-level vars safe; keep it.
- The year buttons in the title call `onSeason`. The `List` tab only exists when `S_LIST` is set. B&F, Stats and Fixture show `EmptySeasonCard` while `S_FIXTURE` is empty.
- `numLabel(pl)` renders `'–'` for `number: null` (recruits whose jersey isn't announced). Use it anywhere a number is displayed.

### Persistence (browser localStorage, per season)
`carlton-board-<year>` (field layout), `carlton-bf-<year>` (B&F votes `{ playerId: { round: 0-4 } }`), `carlton-wheelo-<year>` (ratings), `carlton-results-<year>` (synced results), `carlton-seed-version` / `carlton-seed-version-2027` (seed versioning: bump `SEED_VERSION` in app.src.jsx to force re-seeding bundled rounds), `carlton-season`, plus UI prefs `carlton-view` (`mobile`|`desktop` override) and `carlton-mobile-tab`. Sync adds `carlton-sync` (`{ token, gistId, login, last }`, per device) and `carlton-bf-stamps-<year>` (`{ 'playerId|round': lastChangedMs }`).
**Votes live only in the user's browser.** The toolbar's Backup/Restore buttons export/import JSON. v2 (current) is `{ app, version: 2, exported, season, votes, ratings, board, seasons: { '2026': { votes, ratings, board }, … } }`: **every** season, plus the on-screen season's data at the top level as v1 had it. Restore confirms first and writes each season in `seasons`. A v1 file (`{ app, version: 1, exported, votes, ratings, board }`, no season recorded) restores into the season on screen after asking. Never change existing key names; that would orphan the user's season of votes.

### Main components
`Root` → `App` (state, drag/drop incl. pointer/touch path, backup/restore, team-sheet PNG canvas export, Squiggle sync with allorigins proxy fallback, undo toast, player card) → `LeftPanel` tabs: `ListPanel` (2027), `BFPanel` (vote / leaderboard / `RaceChart`), `StatsPanel` (round dropdown + ‹ ›), `ComparePanel` (H2H), `FixturePanel`, `HistoryPanel`. Board: `Field` (SVG, true AFL proportions in viewBox 480×560 at ~3px/m, 50m arcs = r150 circles from goal lines), `Magnet`, bench, `Sidebar` (quick-find search, `/` to focus; team balance row + selection warnings). Shared: `PlayerPhoto` (local `players/` → CDN → number badge fallback), `ClubLogo`, `GlassCard`, `PlayerCard` + `seasonSummary` (shows last season's stats until the current season has any).

Layout: the middle column is title/toolbar (absolute, top), then a row of `LeftPanel` (420px flex column) + the field column, then the full-width bench strip. The field sizes itself with container-query units (`containerType: 'size'`, `min(100cqh, (100cqw - 120px) * 1.1667)`), leaving room for the FB…FF labels. Don't go back to absolute positioning with `vw` maths; that made the bench and labels sit under the left panel at 1440px.

Board edits: `removePlayer` (all removal paths: double-click, drag back to the list, touch drag off, the card) and `clearBoard` raise an 8-second Undo toast (⌘Z also works). Single click opens the `PlayerCard`. Magnets and bench cards delay it 250ms so a double-click can cancel it.

Shared helpers (above `App`, used by both layouts): `loadJSON`, `loadRatings` (seed versioning), `useUndoToast` + `ToastPill`, `teamBalance`, the team-sheet slot model, `saveTeamSheet` (PNG; share sheet on phones), `teamText`, `downloadBackup`, `restoreBackupFile`.

Team-sheet slots: `TEAM_LINES` names 18 slots (B: BP FB BP … FOL: R RR ROV), each with an x/y spot on the ground, plus 5 interchange. `slotsFromBoard(board)` maps magnets to slots, nearest free slot first, so followers around the centre square come out as followers. `boardFromSlots` writes back, snapping players to slot spots. The board format in localStorage is unchanged (`{ id: {x,y} | {isInterchange, slot} }`), so the phone and the magnet board read each other's teams. The team-sheet export uses the slots (this fixed the old top-to-bottom split that mislabelled followers).

### Vote sync (phone ⇄ Mac)
Through a private gist on Jack's GitHub, file `carlton-votes.json`: `{ app, version: 1, updated, seasons: { '2026': { 'playerId|round': [score or null, lastChangedMs] } } }`. `null` = cleared; a stamp of 0 = a vote from before sync existed.
- Each device connects once with a classic token that has **only the `gist` scope** (`TOKEN_URL` opens GitHub's form with that preselected). `connectSync` finds an existing gist holding that file, or creates one, so a second device lands on the same gist.
- `useVoteSync(votes, setVotes)`, used by both `App` and `MobileApp`, stamps every vote this device changes (by diffing state, so the desktop, mobile and restore paths are all covered). It pushes 1.5s after a change and pulls on open, on focus/visibility, and every 60s while visible.
- `syncVotes` merges **per vote, newest wins**, covering every season (the off-screen ones through localStorage). On an unstamped tie the gist wins, which is why the device with the real votes connects first. A sync that lands while you're voting re-merges, so in-flight votes are kept.
- Tested on 28 Oct 2026 with two browser origins against a mock gist API: legacy push, pull, cleared votes, and an offline conflict (newer edit won, the other offline edit survived). The real `api.github.com` passes CORS preflight for GET, POST and PATCH with `Authorization` (it returns readable 401s with a bad token). Not yet run end to end with a real token.
- UI: desktop toolbar "☁ Synced / Syncing… / Sync failed" button → `Modal` + `SyncPanel`; phone header cloud button (status dot) and ⋯ → "Sync votes" → `Sheet` + `SyncPanel`.

### Mobile (phones)
The head script in the HTML sets `window.CARLTON_PHONE` (screen's short side < 600px) and `window.CARLTON_MOBILE` (phone, unless overridden by `?view=mobile|desktop` or `localStorage['carlton-view']`). Non-mobile on a small screen gets `viewport width=1440`, i.e. the old scaled desktop. `MobileApp` has a header (season switch, ⋯ menu: share image, copy as text, backup, restore, desktop view) and two tabs:
- **Best 23** (`MobileTeam`): the six lines + interchange as tap tiles. Empty slot → `PickerSheet`, pre-filtered to the line's position (R → RUCK), with search, sort by number or average rating, and this or last season's average rating. Filled slot → sheet with `PlayerSummary` + Move (then tap any slot to swap) / Change / Remove (undo toast).
- **B&F votes** (`MobileVotes`): opens on the latest round with ratings. A sticky round picker (‹ select ›, "n left" per round) sits above the result and progress, then the players who played sorted by rating, each with 0–4 buttons (44px). It auto-scrolls to the next unscored player. There's a leaderboard toggle and "show the other players".
The desktop toolbar shows a "Mobile view" button only on phones.

Names: data joins are **exact full name** everywhere. The list has shared surnames (Young, Camporeale, Hollands in 2026), so never match on surname alone. The old H2H fallback credited Flynn Young with Lewis Young's games. Display short names with `shortName()` ('L. Young').

## Weekly data update (the recurring job)
Only edit `data.js`. Steps:
1. Find the latest round in `RESULTS_<year>`. Get new completed games from `https://api.squiggle.com.au/?q=games;year=<year>;team=3` (round 0 = `OR`; `complete === 100`). This API blocks browser CORS but works from server-side fetch.
2. Player stats come from Wheelo's static JSON: `https://www.wheeloratings.com/src/match_stats/table_data/<year><rr>.json` (e.g. `202619.json`). It's column-oriented: `Data[0]` holds parallel arrays (`MatchId`, `Player`, `Team`, `RatingPoints`, `TimeOnGround`, `Kicks`, …). Filter `Team === 'Carlton'` and the Carlton `MatchId` (`<year><rr><gg>`). Expect ~23 players. This is the same data as the site's "Download as CSV". Map Wheelo columns → keys: k=Kicks, hb=Handballs, d=Disposals, de=DisposalEfficiency, mg=MetresGained, i50=Inside50s, cp=ContestedPossessions, gb=GroundBallGets, m=Marks, im=InterceptMarks, cm=ContestedMarks, sg=ShotsAtGoal, g=Goals, b=Behinds, xs=xScore, xsr=xScoreRating, ga=GoalAssists, si=ScoreInvolvements, tk=Tackles, pa=PressureActs, ho=Hitouts, epc=Equity_PreClearance, epoc=Equity_PostClearance, ep=Equity_Possession, ebu=Equity_BallUse.
3. Add: the `MATCH_STATS` round block (players sorted by rating desc), `CSV_R<n>` plus a `buildSeedRatings` entry plus the key in its return object, a `RESULTS_*` entry, and the real date/time in the fixture row.
4. Validate: `npm test`. Every name must exist in the season's player list (report mismatches, don't guess). The player count must match the Wheelo Carlton rows. Rounds with stats appear in the Stats tab automatically (`Object.keys(S_STATS)`).
5. Commit with a message like `R19: Collingwood 90 def Carlton 69`, matching the existing git history.

Finals quirk in 2026: finals were stored as extra rounds (`R25` = Wildcard v Melbourne, `R26` = Elimination Final v Geelong, `tag` set on the fixture row). Follow that pattern unless you refactor finals properly.

**Before using this for 2027**, the 2027 season needs: `FIXTURE_2027` filled, `MATCH_STATS_2027` / `RESULTS_2027` populated by round, and a 2027 seeds builder wired into `SEASONS[2027].seeds` (it's currently `() => ({})`). The `PLAYER_PHOTOS` URLs use the 2026 photo season (`2026014`) and are keyed by jersey number, so new recruits and number changes need entries.

## Current state (as at 26 Oct 2026)
- 2026 is complete: R1–R26 incl. finals. Record in data. The 2027 season tab + list changes were committed 26 Oct 2026.
- 2027 list: 35 players. In: Joel Amartey (FA, Sydney) and Lachie Whitfield (trade, GWS), both `number: null` until jumpers are announced. Out (13): Zac Williams, Jordan Boyd, Lachie Fogarty, Lewis Young, Elijah Hollands, Flynn Young, Harry Charleson, Matt Duffy, Ben & Lucas Camporeale (possible train-ons), Adam Saad (not offered), Hudson O'Keeffe (traded, WB), Flynn Riley (traded).
- Pending moves to add when confirmed: Wil Parker (Collingwood delisted FA), a ruck, November national draft picks (~5, plus a likely father-son/academy bid match), and any train-ons/rookies.
- A Cowork scheduled task `carlton-magnetboard-weekly-update` exists but is **paused**. It's written for 2026 data and Cowork, not Claude Code.
- **Publishing to the phone (GitHub Pages):** `git push` fails from this Mac. The token once embedded in the remote URL and the Keychain login were both dead; the URL is now plain `https://github.com/jackbentick-dev/carlton-magnetboard.git`. On 28 Oct 2026 the update went up through Claude in Chrome instead (Jack is signed in to GitHub there): open `github.com/jackbentick-dev/carlton-magnetboard/upload/main`, upload the changed root files with `file_upload` (copy them to the scratchpad first; Chrome can't read the project folder directly), commit to `main`, then `git fetch && git merge origin/main` locally so the histories stay joined. Pages goes live about a minute later. `scripts/` and the `.gitignore` change are only local (main is ahead of origin by those). Don't ask Jack to use the terminal or make tokens for this.

## Known gaps / ideas backlog
Named saved lineups. Injury/unavailable flags. Self-hosted Oswald font for offline use. Real Carlton monogram SVG. A proper finals model. Magnets (min 150px wide) crowd the ground below ~1440px. Sync boards (best 23) too, not just votes. Home-screen icon for the phone. Done 28 Oct 2026: vote sync via gist. Done 26 Oct 2026: quick-find search, undo on clear/remove, player card on click, selection warnings. Done 28 Oct 2026: mobile layout, slot-based team sheet (followers labelled correctly).

## Conventions & user preferences
- Mobile: tap targets ≥ 44px, inputs/selects 16px (stops iOS zooming on focus), respect `env(safe-area-inset-*)`, no sideways scroll at 320px.
- Mobile sheets (`Sheet`): render through `ReactDOM.createPortal` into `<body>`, never inside the main scroll area. There, iPhone Safari chains a swipe that hits the list's end to the page behind, so the list "gets stuck" (Jack reported this on 28 Oct 2026). Size them in px from `useVisibleViewport()` (visualViewport, so they shrink above the keyboard), not by flex-shrinking, which older Safari gets wrong. Search and filters go in `pinned` so only the list scrolls. Inputs inside call `unshiftAfterKeyboard` on blur. `html, body { overscroll-behavior: none }` stops whole-page rubber-banding.
- iPhone home-screen app: on iOS 26 the page comes up about a status bar short, leaving a strip under the tab bar. It was white in Jack's 28 Oct 2026 screenshot, because the body has only gradients. Fix: `html { background-color: #060d1a }`, so the strip paints the same navy as the tab bar. **Don't size the shell or sheets taller than the viewport to cover it.** Tried on 28 Oct: iOS then shifts the page and every tap lands about a status bar above the finger. The `MobileApp` shell stays `position: fixed; inset: 0`. No Xcode or iOS Simulator on this Mac, so iPhone behaviour is only checked in Chrome's mobile emulation.
- Inline styles throughout, no CSS framework. The palette is Carlton navy (`CARLTON_NAVY #0d1c36`), with white-on-navy for active states. Blue `#60a5fa` is reserved for data highlights. Position colours (`posColors`) appear in the sidebar filters only, **not on magnets** (the user asked for that).
- Jersey numbers are large, in the Oswald font, between photo and name on magnets, bench and sidebar (user requirement). Captain = gold "C" badge (Patrick Cripps). Don't reintroduce `overflow: hidden` on the magnet card; it clips the badge.
- Verify before claiming done. Run the build and headless render, and check data against sources. Never invent player data. If a source is ambiguous (e.g. a recruit's jersey number), leave it null and say so.
- The user wants direct, concise answers and pushback where warranted, without flattery.
- Jack has **no coding experience**. Explain outcomes in plain language (what changed on the board or phone, what he needs to tap), not git, terminals or file names. Do technical steps for him rather than handing them over.
