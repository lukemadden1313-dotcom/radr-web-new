# iOS Canonical: Workout Model

**Source:** `~/Radr-Mobile/Radr/`
**Files audited:**
- `Models/Models.swift` (Workout struct, WorkoutCategory enum, WorkoutPartner)
- `Services/SupabaseService.swift` (WorkoutDTO, CreateWorkoutDTO, ParticipantProfile, workoutSelectWithParticipants query)
- `ViewModels/WorkoutsViewModel.swift` (data flow)

**Audited:** 2026-05-27
**Sync status:** Divergences found between iOS WorkoutDTO and web MockWorkout. See table below.

---

## Overview

iOS has two workout representations:
1. **`Workout`** (Models.swift:536) — in-app model with typed `WorkoutCategory`, `Date` fields, and `[WorkoutPartner]`.
2. **`WorkoutDTO`** (SupabaseService.swift:1744) — Codable DTO matching the `workouts` Supabase table + joined `workout_participants`. This is what RPCs return and what web will receive.

Web should align to **WorkoutDTO** since that's the API contract.

---

## WorkoutDTO Fields (SupabaseService.swift:1744)

| DB column | Swift property | Swift type | Required? | Notes |
|-----------|---------------|------------|-----------|-------|
| `id` | `id` | `String` | Yes | UUID |
| `creator_id` | `creatorId` | `String` | Yes | UUID of host/creator |
| `title` | `title` | `String` | Yes (default `""`) | |
| `description` | `description` | `String?` | No | |
| `category` | `category` | `String?` | No | WorkoutCategory rawValue (e.g. "outdoor-run", "yoga") |
| `location` | `location` | `String?` | No | Free-text string |
| `start_time` | `startTime` | `Date` | Yes | ISO 8601 |
| `duration` | `duration` | `Int?` | No | Minutes |
| `open_to_join` | `openToJoin` | `Bool?` | No | Default true in Workout init |
| `booking_url` | `bookingUrl` | `String?` | No | External link |
| `creator_username` | `creatorUsername` | `String?` | No | Denormalized from profiles |
| `creator_full_name` | `creatorFullName` | `String?` | No | Denormalized from profiles |
| `creator_avatar_url` | `creatorAvatarUrl` | `String?` | No | Denormalized from profiles |
| `google_event_id` | `googleEventId` | `String?` | No | Calendar sync integration |
| `series_id` | `seriesId` | `String?` | No | Links recurring workout instances |
| `group_id` | `groupId` | `String?` | No | UUID of parent group |
| `activity_name` | `activityName` | `String?` | No | Fallback when category is nil |
| `source` | `source` | `String?` | No | "radr", "google_calendar", etc. |
| (joined) | `participants` | `[ParticipantProfile]?` | No | From workout_participants table |

### Computed properties

| Property | Type | Logic |
|----------|------|-------|
| `isPast` | `Bool` | `endTime < Date()` where endTime = startTime + duration minutes |
| `creatorDisplayName` | `String` | First name from creatorFullName, fallback to creatorUsername |
| `resolvedCategory` | `WorkoutCategory` | `fromDB(category)`, fallback to `fromDB(activityName)` |

---

## ParticipantProfile (SupabaseService.swift:1923)

Returned via the `workout_participants` join:

```
participants:workout_participants(user_id, status, profile:profiles(username, avatar_url))
```

| Field | Type | Notes |
|-------|------|-------|
| `user_id` | `String` | UUID |
| `status` | `String?` | e.g. "confirmed", "pending" |
| `profile.username` | `String?` | From joined profiles table |
| `profile.avatar_url` | `String?` | From joined profiles table |

Note: participants do NOT include `full_name` — only username and avatar_url.

---

## WorkoutPartner (Models.swift:525)

In-app model (not DTO) used for local state:

| Field | Type | Notes |
|-------|------|-------|
| `user` | `User` | Full User object |
| `status` | `PartnerStatus` | `.confirmed` or `.pending` |

---

## WorkoutCategory Enum (Models.swift:4)

82+ cases. Key facts:
- Raw values use kebab-case: `"outdoor-run"`, `"indoor-cycle"`, `"high-intensity-interval-training"`
- Legacy aliases: `.run` = `.outdoorRun`, `.strength` = `.traditionalStrength`, etc.
- `fromDB()` handles loose matching (strips prefixes, joins hyphens, maps short names)
- See `docs/ios-canonical/activities.md` for the full list

---

## CreateWorkoutDTO (SupabaseService.swift:1855)

What's sent to create a workout:

| Field | Type | Notes |
|-------|------|-------|
| `creator_id` | `String` | |
| `title` | `String` | |
| `description` | `String?` | |
| `category` | `String?` | |
| `location` | `String?` | |
| `start_time` | `String` | ISO 8601 string (not Date) |
| `duration` | `Int?` | Minutes |
| `open_to_join` | `Bool?` | |
| `google_event_id` | `String?` | |
| `series_id` | `String?` | Recurrence link |
| `group_id` | `String?` | |
| `activity_name` | `String?` | |
| `source` | `String?` | Default "radr" |
| `booking_url` | `String?` | |

---

## Audience / Visibility

**Not a DB field.** iOS does not store an "audience" enum on the workout. Instead:
- `open_to_join: Bool` controls whether non-invitees can join
- Invites are handled through `workout_participants` rows (status = "pending")
- Group association is via `group_id`
- There is no "All Friends" / "Specific Friends" / "Public" field — this is a web-only concept from the /create form

---

## Recurrence

- `series_id: String?` links instances of a recurring workout
- No `repeat` enum on the workout itself — recurrence logic lives in the create flow
- Web's `/create` form has a `repeat` field ("Never" / "Daily" / "Weekly" / "Monthly") but this doesn't map to a workout field. It would create multiple workout rows linked by `series_id`.

---

## DIVERGENCE TABLE: MockWorkout vs iOS WorkoutDTO

| MockWorkout field | iOS WorkoutDTO field | Match? | Action needed |
|-------------------|---------------------|--------|---------------|
| `id: string` | `id: String` | OK | |
| `title: string` | `title: String` | OK | |
| `start_time: string` | `startTime: Date` (serialized as ISO string) | OK | Same wire format |
| `location: string` | `location: String?` | TYPE MISMATCH | MockWorkout has required `string`, iOS has optional. Fix: make optional |
| `host: MockUser` | `creatorId + creatorUsername + creatorFullName + creatorAvatarUrl` | STRUCTURE MISMATCH | iOS flattens creator fields, not a nested User object. Web must assemble or adapt. |
| `cohosts: MockUser[]` | (does not exist) | WEB-ONLY | iOS has no cohost concept. Remove from MockWorkout or keep as web enhancement. |
| `participants: MockUser[]` | `participants: [ParticipantProfile]?` | SHAPE MISMATCH | iOS participants have `{user_id, status, profile: {username, avatar_url}}` — no full_name, no initials. Web has full MockUser objects. |
| `participant_cap: number \| null` | `maxPartners: Int?` (on Workout model only, NOT on DTO) | MISSING FROM DTO | Not on WorkoutDTO. May need RPC expansion or lives only on the in-app Workout model. |
| `description: string` | `description: String?` | TYPE MISMATCH | MockWorkout has required, iOS has optional. Fix: make optional |
| `cover_image_url: string \| null` | (does not exist) | WEB-ONLY | iOS has no cover image field. Web invention. |
| `cover_gradient: string` | (does not exist) | WEB-ONLY | iOS has no cover gradient. Web uses for visual polish. |
| `group_id: string \| null` | `groupId: String?` | OK | |
| `open_to_join: boolean` | `openToJoin: Bool?` | OK | iOS is optional, web is required. Minor. |
| `booking_url: string \| null` | `bookingUrl: String?` | OK | |
| `activity_type: string` | `category: String?` + `activityName: String?` | NAME MISMATCH | Web uses single `activity_type`, iOS has two fields. Use `resolvedCategory` logic. |
| (missing) | `duration: Int?` | MISSING ON WEB | Add to MockWorkout |
| (missing) | `createdAt: Date` (on Workout model) | MISSING ON WEB | Not critical but useful |
| (missing) | `googleEventId: String?` | MISSING ON WEB | Calendar sync — low priority |
| (missing) | `seriesId: String?` | MISSING ON WEB | Recurrence linking |
| (missing) | `source: String?` | MISSING ON WEB | "radr", "google_calendar" |

### Summary of action items

1. **Host structure:** Flatten `host: MockUser` → `creator_id` + `creator_username` + `creator_full_name` + `creator_avatar_url`, OR keep MockUser wrapper but document the mapping.
2. **Participants shape:** Adapt from `MockUser[]` to `{user_id, status, profile: {username, avatar_url}}[]`. Notably: iOS participants lack `full_name` — only username.
3. **Remove `cohosts`:** iOS doesn't have this concept.
4. **Remove `cover_image_url` and `cover_gradient`:** Web inventions. Keep for visual purposes but mark as web-only.
5. **Add `duration`:** Required field missing from web.
6. **Make `location` and `description` optional.**
7. **Rename `activity_type`:** Map to `category` + `activityName` or use `resolvedCategory`.

---

## Web Implementation Notes

1. The `workoutSelectWithParticipants` query joins `workout_participants` with `profiles` — this is the canonical select for fetching workouts. Web RPCs should use the same pattern.
2. Web's `/workouts/[id]` page renders a host avatar + name, participant avatars, and activity-based cover images. When wiring to real data, the host info comes from flattened `creator_*` fields (not a joined User object), and participant profiles only include `username` + `avatar_url` (no `full_name`).
3. Web's cover images are generated from `activity_type` via Unsplash URLs. This can stay client-side — it's a web UI enhancement, not a data contract.
4. The `/create` form's `audience` concept ("All Friends" / "Specific Friends" / "Public") doesn't map to a workout field. It maps to: public = `open_to_join: true`, specific = invite specific `workout_participants`, all friends = invite all friends as participants.

---

## Sync Strategy

When Luke wires real RPCs:
- `getWorkout(id)` → `select workoutSelectWithParticipants where id = :id`
- Web assembles host from `creator_*` fields
- Web assembles participant list from `participants[].profile`
- `cover_gradient` and `cover_image_url` stay web-only (derived from activity)
- `cohosts` field is dropped
- `activity_type` → `category` (with `activityName` fallback via resolvedCategory logic)
