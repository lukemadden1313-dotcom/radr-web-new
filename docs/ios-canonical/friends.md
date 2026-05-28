# iOS Canonical: Friends & Friend-Finding

**Source:** `~/Radr-Mobile/Radr/`
**Files audited:**
- `Models/Models.swift` (FriendRequest, SuggestedFriend structs)
- `Services/SupabaseService.swift` (FriendshipDTO, SuggestedUserDTO, ProfileDTO)
- `ViewModels/FriendsViewModel.swift` (all friend operations)
- `Views/Friends/FriendsView.swift` (main friends surface — two tabs)
- `Views/Friends/SearchFriendsView.swift` (standalone search/discover)
- `Views/Profile/DiscoverFriendsCard.swift` (dashboard discover card)

**Audited:** 2026-05-27
**Sync status:** Web mock data aligned to these findings.

---

## Overview

Friends on iOS are modeled via a `friendships` table with `requester_id`, `receiver_id`, and `status` columns. The main friends surface (`FriendsView`) has two tabs: **Discover** and **Friends**. A separate `SearchFriendsView` provides a focused search-first experience. Friend requests appear as a banner in `FriendsView` and inline in search results.

---

## Friend Relationship Model

### FriendRequest.RequestStatus (Models.swift:596)

```swift
enum RequestStatus: String, Codable {
    case pending, accepted, declined
}
```

### FriendshipDTO (SupabaseService.swift:1905)

```swift
struct FriendshipDTO: Codable, Identifiable {
    let id: String
    let requesterId: String   // "requester_id"
    let receiverId: String    // "receiver_id"
    let status: String        // "pending" | "accepted" | "declined"
    var requester: Profile?
    var receiver: Profile?
    var isBestFriend: Bool?   // "is_close_friend"
}
```

### SuggestedUserDTO.friendshipState (SupabaseService.swift:1538)

The `search_users` RPC returns a `friendship_state` column per result:
- `"none"` — no relationship
- `"incoming_pending"` — they sent current user a request

```swift
let friendshipState: String?  // "none" or "incoming_pending"
var hasIncomingRequest: Bool { friendshipState == "incoming_pending" }
```

### Effective states for web (derived)

| State | Meaning | How determined |
|-------|---------|----------------|
| `none` | No relationship | No friendship row exists |
| `request_sent` | Current user sent request | Pending row where requester = current user |
| `request_received` | Other user sent request | Pending row where receiver = current user (or friendshipState == "incoming_pending") |
| `friends` | Accepted friendship | Accepted row exists |
| `blocked` | **Not modeled** | No block concept in current iOS code |

Note: iOS uses "Follow" as the button label for sending requests (not "Add Friend"), but the underlying model is still a friend request, not a follow.

---

## Search UI (SearchFriendsView.swift)

- **Title bar:** "Find Friends"
- **Search bar:** TextField with magnifying glass icon, "Search by name or username" placeholder
- **Debounce:** 300ms (`Task.sleep(nanoseconds: 300_000_000)`)
- **Min characters:** 2 (trimmed)
- **Empty search state:** Shows "Suggested" section header + first 10 `discoverUsers`
- **Active search state:** Shows "Results" section header + `searchUsers` RPC results
- **Empty results:** "No users found" with magnifying glass icon
- **Empty suggestions:** "No suggestions yet" with person.2 icon

### Row structure (profileRow)

| Element | Details |
|---------|---------|
| Avatar | AvatarView, 44px, with initials fallback |
| Name | Bold subheadline, 1 line |
| Username | @username, caption, secondary text, 1 line |
| Status line | "Wants to be friends" (accent, caption2) if incoming request, OR "{N} mutual friend(s)" (accent, caption2) if mutual > 0 |
| Action button | "Accept" (filled accent pill) if incoming request, OR "Follow" (outline accent pill) if not |

### Accept inline

When "Accept" tapped in search results:
1. Calls `acceptFriendRequestBySenderId(senderId:)`
2. Optimistically removes row from search results
3. Force-reloads friends + pending requests
4. Shows "Friend request accepted" toast

---

## FriendsView (main surface)

### Layout

1. **Header:** "Friends" title + person.badge.plus icon (opens requests sheet, badge = incoming count)
2. **Search bar:** Filters both tabs locally by name/username
3. **Friend Requests Banner:** Shows when incoming pending requests exist
   - Overlapping avatars (up to 3) + "{N} friend request(s)" + "Tap to review" + "Review" button
   - Taps to open requests sheet
4. **Tabs:** Segmented picker — "Discover" (0) | "Friends" (1)
5. **Content:** TabView with swipe between tabs

### Discover tab

- **Quick actions:** "Find Friends" + "Invite" + "Contacts" buttons
- **"PEOPLE YOU MAY KNOW"** section: horizontal scroll of profile cards (first 7 discover users)
  - Each card: avatar, name, username, mutual count, "Follow" button
- **"SUGGESTED"** section: vertical list below horizontal scroll
  - Each row: avatar + name + username + mutual count + "Follow" outline pill
  - Outgoing pending requests shown with "Pending" label + long-press to cancel

### Friends tab

- **Top Friends:** Up to 3 friends sorted by shared workout count (only those with >= 1 shared workout)
  - Shows shared workout count + next upcoming/recent workout
- **All Friends:** Remaining friends alphabetically
  - Each row: avatar + name + username
  - Long-press context menu: "Remove Friend" (with confirmation alert)
- **Empty state:** "No friends yet" with "Find Friends" button

### Friend request management (sheet)

- Presented as a sheet from the banner or header icon
- Lists incoming pending requests
- Each row: avatar + name + username + Accept/Decline buttons
- Accept: calls `acceptRequest(requestId:userId:requesterId:accepterName:)` — optimistic UI, notifies requester
- Decline: calls `declineRequest(requestId:userId:)` — optimistic UI

---

## Discover Friends Card (DiscoverFriendsCard.swift)

Dashboard card that leads to the friends surface.

- **Title:** "Discover friends" (italic, medium weight) + accent dot
- **Subtitle:** "{N} people on your Radr" or "Invite a friend" if empty
- **Avatar stack:** First 2 suggested user avatars overlapping + "+{N}" circle if more
- **Background:** dark (#0f0f0f), rounded 14, subtle white border
- **Tap action:** Opens SearchFriendsView (or FriendsView depending on context)

---

## ViewModel Operations (FriendsViewModel.swift)

| Operation | Method | Notes |
|-----------|--------|-------|
| Load friends | `loadFriends(userId:)` | 30s staleness cache |
| Load pending | `loadPendingRequests(userId:)` | 30s staleness cache |
| Send request | `sendFriendRequest(fromId:toId:senderName:)` | Optimistic append to pending, inserts notification |
| Accept request | `acceptRequest(requestId:userId:requesterId:accepterName:)` | Optimistic remove from pending, force-reload friends, notifies requester |
| Decline request | `declineRequest(requestId:userId:)` | Optimistic remove from pending |
| Cancel request | `cancelFriendRequest(fromId:toId:)` | Removes outgoing pending, calls removeFriend RPC |
| Remove friend | `removeFriend(friendId:userId:)` | Optimistic remove from friends list |
| Toggle best friend | `toggleBestFriend(friendId:userId:)` | Updates is_close_friend flag |
| Load discover | `loadDiscoverUsers(userId:)` | Mutual suggestions first, then random profiles, excludes friends + pending |
| Search users | `searchUsers(query:userId:)` | Server-side via search_users RPC, min 2 chars |
| Load shared workouts | `loadSharedWorkouts(userId:)` | Parallel fetch per friend |

---

## Web Implementation Notes

1. **Friend states:** Web uses derived enum `"none" | "request_sent" | "request_received" | "friends"` — no blocked state exists in iOS.
2. **Button labels:** iOS uses "Follow" for send-request action, but web uses "+ Add" to be clearer about the bidirectional friend model (vs a one-way follow).
3. **Search:** iOS debounces 300ms with 2-char minimum. Web filters mock data client-side for now; when wired to backend, should use same `search_users` RPC with debounce.
4. **Suggested users algorithm:** Mutual connections first (`getFriendSuggestions` RPC), then random profiles as fallback. Web mocks this with `mutual_friends_count` but doesn't compute ranking.
5. **Best friends:** iOS has `is_close_friend` flag — not surfaced on web yet. Can add later.
6. **Shared workouts per friend:** iOS shows shared workout count + next shared workout in the Friends tab. Web defers this to profile page.
7. **Requests sheet vs inline:** iOS uses a separate sheet for request management. Web shows requests inline on the /friends page for simplicity.

---

## Sync Strategy

Web's friend mock data and `/friends` page structure are aligned to these iOS patterns. When Luke wires to backend:
- `searchUsers` → `search_users` RPC (returns SuggestedUserDTO with friendship_state)
- `getIncomingFriendRequests` → `getPendingRequests` filtered by receiver = current user
- `getSuggestedUsers` → `loadDiscoverUsers` pattern (getFriendSuggestions + getAllProfiles fallback)
- Accept/Decline/Send → existing SupabaseService methods
