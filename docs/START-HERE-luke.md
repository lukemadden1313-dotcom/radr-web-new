# Hey Luke - Start Here

This is the **radr-web-new** companion site, built on the `eli` branch. Everything runs on mock data with iOS-aligned contracts. Your job: swap mock data for real Supabase RPCs.

## Where to start

Read **`docs/handoff-to-luke.md`** first. It's the map. Everything you need is in there:
- Every route, every RPC, every stubbed action
- Data contracts, open questions, inherited backlog

## The mental model

Every page is **built and walkable** right now. The seam is `src/lib/mock-data.ts` — it exports constants (MOCK_WORKOUTS, MOCK_GROUPS, etc.) and helpers (getUserByUsername, getMutualFriends, etc.) that every page consumes. Each call site has a `// TODO: wire [rpc_name]` comment telling you exactly what to replace it with.

**Pattern:** Find a `// TODO: wire` comment → replace the mock call with a Supabase RPC → done.

Interactive actions (RSVP, comments, friend requests, toggles) are currently **optimistic-only** — they update the UI immediately but reset on reload. Wire the RPCs and they become real.

## Key docs

| Doc | What it covers |
|---|---|
| `docs/handoff-to-luke.md` | The full backend integration spec (start here) |
| `docs/ios-canonical/*.md` | 7 data contract specs extracted from iOS code |
| `docs/ios-needs-to-add.md` | Features web has that iOS doesn't yet (web leads) |
| `docs/future-gamification.md` | Parked gamification ideas (streaks, badges, leaderboards) |
| `docs/polish-backlog.md` | Non-blocking visual polish items |

## What's deliberately app-only

These are **not** coming to web — by design:
- **Messaging** — web shows an "Open in Radr" landing for conversation links
- **Crew creation** — web shows an "Open in Radr" prompt; creation lives in iOS
- **Deep settings** (Calendar Sync, Blocked Users) — web shows "Open in Radr" prompts

## Where web leads iOS

Web shipped features iOS doesn't have yet. iOS needs to add these so both platforms match:
- **Maybe RSVP** — 3-way picker (Going / Maybe / Can't go)
- **Profile birthday** — birthday month display
- **Hosted count** — "X Hosted" stat on profile
- **Group description + cover photo** — web shows these, iOS doesn't

See `docs/ios-needs-to-add.md` for the full list.

## Running it

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # verify before pushing
```

That's it. Grab me if anything's unclear.

## After wiring: joint review

Once the backend is wired, Eli + Luke do a close pass together — button by button, on real data — to confirm what's actually working and fix what isn't. Many buttons are currently honest stubs (optimistic UI or "open in app" prompts) marked with `// TODO: wire ...` — the joint review is where we turn those into the real thing against live Supabase data, rather than perfecting them on mock data now.

Also: Eli is making parallel iOS frontend changes to match web (wording/voice, Going/Maybe/Can't RSVP, social polish). See `docs/ios-needs-to-add.md` for the web-leads features iOS is catching up to. Data shapes stay aligned to `docs/ios-canonical/*.md` — only visual/wording changes on iOS; any structural/field change gets flagged so web + backend stay in sync.

-- Eli
