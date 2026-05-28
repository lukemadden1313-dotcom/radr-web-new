# iOS Canonical: Profile / User Model

**Source:** `~/Radr-Mobile/Radr/`
**Files audited:**
- `Models/Models.swift` (User struct, Profile struct, UserStats struct)
- `ViewModels/AuthViewModel.swift` (updateProfile, loadProfile)
- `Views/Profile/ProfileView.swift` (self-view: ProfileView + EditProfileView)
- `Views/Profile/PublicProfileView.swift` (other-user view)

**Audited:** 2026-05-28
**Sync status:** MODERATE DIVERGENCE. Web invented `parties_attended` and `hosted_count` — iOS uses `totalWorkouts` and `currentStreak` (from Profile table). Web is missing stats fields, notification preferences, and `email`.

---

## Overview

iOS has TWO user models:
1. **User** (Models.swift) — lightweight, used throughout the app for display (friend lists, participants, etc.)
2. **Profile** (Models.swift) — full Supabase `profiles` table row, used for the authenticated user's own data

The `User` struct is NOT fetched from a dedicated table — it's assembled from profile joins or friend-list RPCs. The `Profile` struct maps 1:1 to the Supabase `profiles` table.

---

## User Struct (Models.swift)

| Field | Swift type | Optional? | Notes |
|-------|------------|-----------|-------|
| `id` | `String` | required | UUID |
| `name` | `String` | required | Display name (equivalent to `full_name`) |
| `username` | `String` | required | |
| `avatar` | `String?` | optional | Avatar URL |
| `bio` | `String?` | optional | |
| `notifyOnActivity` | `Bool?` | optional | Per-friend notification preference |
| `isBestFriend` | `Bool?` | optional | Close friend / best friend flag |

### Key difference from web
iOS calls it `name` (not `full_name`). iOS calls it `avatar` (not `avatar_url`). These are just naming differences — same data.

---

## Profile Struct (Models.swift) — Supabase `profiles` table

| DB column | Swift property | Swift type | Optional? | Notes |
|-----------|---------------|------------|-----------|-------|
| `id` | `id` | `String` | required | Auth user UUID |
| `username` | `username` | `String?` | optional | |
| `email` | `email` | `String?` | optional | From auth, stored in profile |
| `avatar_url` | `avatarUrl` | `String?` | optional | |
| `full_name` | `fullName` | `String?` | optional | |
| `bio` | `bio` | `String?` | optional | |
| `total_workouts` | `totalWorkouts` | `Int?` | optional | **Server-computed stat** |
| `current_streak` | `currentStreak` | `Int?` | optional | **Server-computed stat** |
| `created_at` | `createdAt` | `Date?` | optional | Account creation date |
| `notify_friend_requests` | `notifyFriendRequests` | `Bool?` | optional | Push notification pref |
| `notify_friend_request_accepted` | `notifyRequestAccepted` | `Bool?` | optional | |
| `notify_workout_updates` | `notifyWorkoutUpdates` | `Bool?` | optional | |
| `notify_upcoming_reminders` | `notifyUpcomingReminders` | `Bool?` | optional | |
| `notify_friend_posted_workout` | `notifyFriendPostedWorkout` | `Bool?` | optional | |
| `notify_messages` | `notifyMessages` | `Bool?` | optional | |
| `notify_reactions` | `notifyReactions` | `Bool?` | optional | |
| `notify_invites` | `notifyInvites` | `Bool?` | optional | |
| `notify_joins` | `notifyJoins` | `Bool?` | optional | |
| `notify_comments` | `notifyComments` | `Bool?` | optional | |
| `notify_mentions` | `notifyMentions` | `Bool?` | optional | |
| `notify_new_friend_on_radr` | `notifyNewFriendOnRadr` | `Bool?` | optional | |
| `calendar_preference` | `calendarPreference` | `String?` | optional | Google Calendar sync pref |

---

## Stats Display

### Self-view (ProfileView.swift)
Shows 3 stat columns:
1. **Workouts** — `profile.totalWorkouts` (from `profiles.total_workouts`)
2. **Day Streak** — `profile.currentStreak` (from `profiles.current_streak`) with flame icon
3. **With Friends** — `MockData.userStats.workoutsWithFriends` (currently hardcoded from MockData, NOT from profile table)

### Other-user view (PublicProfileView.swift)
Shows **NO stats** on the public profile. The hero section shows: avatar, first name (italic with accent dot), @username, bio. No workout count, no streak, no stats row.

### UserStats struct (Models.swift)
```swift
struct UserStats: Codable {
    var totalWorkouts: Int
    var currentStreak: Int
    var longestStreak: Int
    var weeklyGoal: Int
    var weeklyProgress: Int
    var totalMinutes: Int
    var workoutsWithFriends: Int
    var favoriteCategory: WorkoutCategory
}
```
This struct exists but is ONLY used via `MockData.userStats` — it's not fetched from any API. The real stats come from the `profiles` table (`total_workouts`, `current_streak`).

---

## Editable Fields (EditProfileView — ProfileView.swift:526)

The edit profile form has exactly 4 editable fields:

| Field | Input type | Constraints | Notes |
|-------|-----------|-------------|-------|
| **Avatar** | PhotosPicker → crop → upload | JPEG, circular crop | Uploaded to Supabase storage `avatars/{userId}/` |
| **Full Name** | Text field | Label says "FIRST NAME" but field is `fullName` | Hint: "Shown to friends across the app" |
| **Username** | Text field | Unique handle | Hint: "Your unique handle" |
| **Bio** | Multi-line text (3-6 lines) | No explicit length limit in UI | Placeholder: "Tell your friends what you're about" |

### What is NOT editable
- Email (shown on profile but not editable in EditProfileView)
- Birthday / birthday_month (does not exist in iOS Profile model)
- Joined date (read-only, from `created_at`)
- Stats (server-computed)
- Notification preferences (separate settings view, not part of edit profile)

### Save flow
`saveProfile()` calls `authViewModel.updateProfile(username:, fullName:, bio:, avatarUrl:)` which sends a `ProfileUpdate` to `supabase.updateProfile()`. Only non-nil fields are sent.

---

## Self-View vs Other-View

| Feature | Self (ProfileView) | Other (PublicProfileView) |
|---------|-------------------|--------------------------|
| Avatar | Standard | RadarSweepAvatar (animated) |
| Name display | Full name | First name only (italic + accent dot) |
| @username | Shown | Shown |
| Email | Shown | Not shown |
| Bio | Shown | Shown |
| Stats row | 3 stats (Workouts, Streak, With Friends) | None |
| Edit button | "Edit Profile" button | Not shown |
| Action buttons | Settings gear | Add Friend / Message / Invite to Workout |
| Mutual friends | N/A | Shown with avatar stack |
| Shared workouts | N/A | "Workouts Together" section |
| Joinable workouts | N/A | "You Could Join" section |
| Shared groups | N/A | Shared crews section |

---

## DIVERGENCE TABLE: MockUser vs iOS User + Profile

| MockUser field | iOS equivalent | Match? | Action needed |
|---------------|---------------|--------|---------------|
| `id: string` | `User.id: String` / `Profile.id: String` | OK | |
| `full_name: string` | `User.name: String` / `Profile.fullName: String?` | NAMING | iOS User calls it `name`, Profile calls it `full_name`. Same data. |
| `username: string` | `User.username: String` / `Profile.username: String?` | OK | |
| `avatar_url: string \| null` | `User.avatar: String?` / `Profile.avatarUrl: String?` | NAMING | iOS User calls it `avatar`, Profile calls it `avatar_url`. Same data. |
| `initials: string` | (does not exist) | WEB-ONLY | Computed client-side for avatar fallback. Keep as web helper. |
| `gradient_seed: string` | (does not exist) | WEB-ONLY | Computed client-side for avatar fallback gradient. Keep as web helper. |
| `birthday_month?: string` | (does not exist) | INVENTED | iOS Profile has NO birthday field at all. Remove or keep as future feature. |
| `joined_at?: string` | `Profile.createdAt: Date?` | RENAMED | Same concept, different name. Rename to `created_at`. |
| `bio?: string` | `User.bio: String?` / `Profile.bio: String?` | OK | |
| `parties_attended?: number` | (does not exist) | INVENTED | iOS has `Profile.totalWorkouts` (server-computed). Rename to `total_workouts`. |
| `hosted_count?: number` | (does not exist) | INVENTED | iOS has no "hosted count" field. Could be computed from workouts where `creator_id = user_id`, but it's not a profile field. Remove or compute client-side. |
| (missing) | `Profile.email: String?` | MISSING | Not critical for display but exists on profile. |
| (missing) | `Profile.totalWorkouts: Int?` | MISSING | Server-computed stat. Add to MockUser or fetch separately. |
| (missing) | `Profile.currentStreak: Int?` | MISSING | Server-computed stat. |
| (missing) | `User.notifyOnActivity: Bool?` | MISSING | Per-friend notification toggle. |
| (missing) | `User.isBestFriend: Bool?` | MISSING | Close friend flag. |
| (missing) | 12x `notify_*` preferences | MISSING | Push notification settings. Lives on Profile, not needed for display. |
| (missing) | `Profile.calendarPreference: String?` | MISSING | Google Calendar sync setting. |

### Summary
- 2 invented stat fields: `parties_attended` (should be `total_workouts`), `hosted_count` (not an iOS field)
- 1 invented field: `birthday_month` (iOS has no birthday)
- 2 web-only helper fields: `initials`, `gradient_seed` (fine to keep)
- Missing: `total_workouts`, `current_streak`, `email`, `isBestFriend`, `notifyOnActivity`
- `joined_at` should be renamed to `created_at`

---

## Web Implementation Notes

1. **Stats rename:** `parties_attended` → `total_workouts`, and source from Profile table. `hosted_count` has no iOS equivalent — either compute client-side from workouts or drop it.
2. **No birthday:** iOS has no birthday concept. Web's `birthday_month` is invented. Keep it as a future web-leads-iOS feature if desired, but don't expect backend support.
3. **Other-user profile has NO stats:** iOS public profiles show avatar + name + username + bio + mutual friends + shared workouts/groups. No stat counters. Web currently shows invented stats — consider removing from other-user view.
4. **Edit profile is simple:** Only 4 fields (avatar, full name, username, bio). No birthday, no email editing, no stat editing.
5. **Avatar fallback:** iOS uses `AvatarView(urlString:, fallback:, size:)` — fallback is derived from name. Web's `initials` + `gradient_seed` serve the same purpose. Keep as web-only helper fields.

---

## Sync Strategy

When Luke wires real profiles:
1. Profile fetch: `SELECT id, username, full_name, avatar_url, bio, total_workouts, current_streak, created_at FROM profiles WHERE id = $1`
2. For self-view: also fetch email, notification preferences
3. For other-user view: fetch mutual friends via RPC, shared workouts via RPC, shared groups via RPC
4. Stats: `total_workouts` and `current_streak` from profile table (server-computed)
5. Edit profile: `updateProfile(username, fullName, bio, avatarUrl)` — same 4 fields as iOS
6. `initials` and `gradient_seed` remain client-computed from `full_name`/`username`
