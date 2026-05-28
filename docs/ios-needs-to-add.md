# iOS Needs to Add — Web-Leads Features

**Purpose:** The web app was built leading the iOS redesign in places. These are features/fields present on web that iOS does NOT yet have. iOS (Luke) must add these so the two platforms match and can share the same Supabase backend.

**Last updated:** 2026-05-28

| Feature | What web has | What iOS needs | Backend impact |
|---|---|---|---|
| Maybe RSVP | RSVP supports going/maybe/cant — 3-way picker on workout detail | iOS RSVP only has going (no maybe). Add Maybe state to RSVP UI + model | `workout_participants.status` enum must allow `"maybe"` + `"cant"` |
| Profile birthday | Profile shows birthday month (e.g. "August") | iOS Profile has no birthday field | `profiles` table needs `birthday_month` column (varchar, month name only) |
| Hosted count | Profile shows "X Hosted" stat | iOS has no hosted-workouts count | Either add `hosted_count` column to `profiles` (server-computed), or compute from `SELECT count(*) FROM workouts WHERE creator_id = user_id` |
| Group description | MockGroup has a `description` field shown on group pages | iOS GroupDTO has no description | `groups` table needs `description` column (text, nullable) |
| Group cover photo | Web shows `cover_photo_url` + `cover_gradient` on group cards | iOS only has `avatar_url` for groups | `groups` table needs `cover_photo_url` column (text, nullable), or web keeps these as cosmetic-only |

## Notes

- This list is the counterpart to `docs/ios-canonical/*.md` (which documents iOS → web alignment). This doc is web → iOS.
- Items here are "web leads" features that Eli decided to keep on web despite not existing on iOS yet.
- As more web-leads features are found, append here.
- The `docs/ios-canonical/profiles.md` and `docs/ios-canonical/groups.md` divergence tables reference this doc for web-leads fields.
