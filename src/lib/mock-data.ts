// ================================================================
// Mock data for Radr web prototype
// TODO: Replace each usage with the appropriate Supabase RPC when backend is ready.
// ================================================================

export type MockUser = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  initials: string;
  gradient_seed: string;
};

export type MockWorkout = {
  id: string;
  title: string;
  start_time: string;
  location: string;
  host: MockUser;
  cohosts: MockUser[];
  participants: MockUser[];
  participant_cap: number | null;
  description: string;
  cover_image_url: string | null;
  cover_gradient: string;
  group_id: string | null;
  open_to_join: boolean;
  booking_url: string | null;
  activity_type: string;
};

export type MockGroup = {
  id: string;
  name: string;
  description: string;
  avatar_url: string | null;
  cover_photo_url: string | null;
  cover_gradient: string;
  member_count: number;
  members: MockUser[];
  upcoming_workouts: MockWorkout[];
  creator_id: string;
};

export type MockNotification = {
  id: string;
  type:
    | "rsvp_yes"
    | "rsvp_maybe"
    | "friend_request"
    | "workout_invite"
    | "group_invite"
    | "workout_reminder";
  actor: MockUser;
  target_workout?: MockWorkout;
  target_group?: MockGroup;
  created_at: string;
  unread: boolean;
};

export type MockRecommendation = {
  workout: MockWorkout;
  reason: string;
};

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

function daysFromNow(days: number, hour = 8, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function daysAgo(days: number, hour = 8, minute = 0): string {
  return daysFromNow(-days, hour, minute);
}

// ----------------------------------------------------------------
// Users
// ----------------------------------------------------------------

// TODO: replace with auth context / Supabase profile query
export const CURRENT_USER: MockUser = {
  id: "u-eli",
  full_name: "Eli Goldman",
  username: "eli",
  avatar_url: null,
  initials: "EG",
  gradient_seed: "E",
};

export const MOCK_FRIENDS: MockUser[] = [
  {
    id: "u-luke",
    full_name: "Luke Madden",
    username: "lukemadden",
    avatar_url: null,
    initials: "LM",
    gradient_seed: "L",
  },
  {
    id: "u-finn",
    full_name: "Finn Woelm",
    username: "finnwoelm",
    avatar_url: null,
    initials: "FW",
    gradient_seed: "F",
  },
  {
    id: "u-michael",
    full_name: "Michael Rapadas",
    username: "michaelrapadas",
    avatar_url: null,
    initials: "MR",
    gradient_seed: "M",
  },
  {
    id: "u-kyrah",
    full_name: "Kyrah Stewart",
    username: "kkrysp",
    avatar_url: null,
    initials: "KS",
    gradient_seed: "K",
  },
  {
    id: "u-danny",
    full_name: "Danny Bauer",
    username: "dannybauer",
    avatar_url: null,
    initials: "DB",
    gradient_seed: "D",
  },
  {
    id: "u-brandon",
    full_name: "Brandon Soxman",
    username: "soxy711",
    avatar_url: null,
    initials: "BS",
    gradient_seed: "B",
  },
  {
    id: "u-jb",
    full_name: "JB Smoove",
    username: "jbsmoove",
    avatar_url: null,
    initials: "JB",
    gradient_seed: "J",
  },
  {
    id: "u-kiera",
    full_name: "Kiera McNally",
    username: "kieramcnally",
    avatar_url: null,
    initials: "KM",
    gradient_seed: "K",
  },
  {
    id: "u-tye",
    full_name: "Tye Johnson",
    username: "tyejohnson",
    avatar_url: null,
    initials: "TJ",
    gradient_seed: "T",
  },
  {
    id: "u-charles",
    full_name: "Charles Okoye",
    username: "charlesokoye",
    avatar_url: null,
    initials: "CO",
    gradient_seed: "C",
  },
];

// Shorthand refs
const [luke, finn, michael, kyrah, danny, brandon, jb, kiera, tye, charles] =
  MOCK_FRIENDS;

// ----------------------------------------------------------------
// Groups
// ----------------------------------------------------------------

// TODO: replace with get_group_for_deep_link or expanded group RPC
export const MOCK_GROUPS: MockGroup[] = [
  {
    id: "g-cycle",
    name: "Cycle crew",
    description:
      "We ride at 6 AM. Indoor cycling enthusiasts across NYC — Peloton studios, SoulCycle, and the occasional outdoor century.",
    avatar_url: null,
    cover_photo_url: "https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=600&h=400&fit=crop",
    cover_gradient: "linear-gradient(135deg, #2AD472 0%, #1a9e54 30%, #0C5DE9 70%, #093fb0 100%)",
    member_count: 14,
    members: [CURRENT_USER, luke, finn, kyrah, danny, brandon, kiera, tye],
    upcoming_workouts: [], // filled below
    creator_id: luke.id,
  },
  {
    id: "g-sunday",
    name: "Sunday runners",
    description:
      "Long runs every Sunday morning. Central Park loop, Brooklyn Bridge, or the West Side Highway — depends on the vibe.",
    avatar_url: null,
    cover_photo_url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=400&fit=crop",
    cover_gradient: "linear-gradient(135deg, #0C5DE9 0%, #3A7EF2 30%, #9A5AF0 70%, #6b3dbd 100%)",
    member_count: 9,
    members: [CURRENT_USER, michael, danny, jb, charles, brandon],
    upcoming_workouts: [],
    creator_id: michael.id,
  },
  {
    id: "g-climb",
    name: "Climb crew",
    description:
      "Bouldering and top-rope at VITAL and Brooklyn Boulders. All levels welcome — we send and we spot.",
    avatar_url: null,
    cover_photo_url: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&h=400&fit=crop",
    cover_gradient: "linear-gradient(135deg, #9A5AF0 0%, #7a3dd4 30%, #2AD472 70%, #1a9e54 100%)",
    member_count: 7,
    members: [CURRENT_USER, finn, kyrah, tye, kiera],
    upcoming_workouts: [],
    creator_id: finn.id,
  },
];

const [cycleCrew, sundayRunners, climbCrew] = MOCK_GROUPS;

// ----------------------------------------------------------------
// Workouts
// ----------------------------------------------------------------

// TODO: replace with get_workout_for_deep_link or feed RPC
export const MOCK_WORKOUTS: MockWorkout[] = [
  {
    id: "w-good-sat",
    title: "Good Saturdays is back!!",
    start_time: daysFromNow(5, 9, 0),
    location: "Barry's Bootcamp, Chelsea",
    host: luke,
    cohosts: [CURRENT_USER],
    participants: [CURRENT_USER, luke, finn, kyrah, danny, brandon, kiera],
    participant_cap: 20,
    description:
      "The legendary Saturday morning bootcamp returns. Bring energy, bring a friend, bring a towel. We go hard then we brunch.",
    cover_image_url: null,
    cover_gradient: "linear-gradient(135deg, #0C5DE9 0%, #3A7EF2 30%, #5b9cf5 60%, #0A4FC5 100%)",
    group_id: null,
    open_to_join: true,
    booking_url: null,
    activity_type: "HIIT",
  },
  {
    id: "w-central-park",
    title: "Central Park 6-miler",
    start_time: daysFromNow(1, 7, 0),
    location: "Engineers' Gate, East 90th St & 5th Ave",
    host: michael,
    cohosts: [],
    participants: [CURRENT_USER, michael, danny, jb, charles],
    participant_cap: null,
    description: "Easy Sunday pace. Full lower loop. Meet at Engineers' Gate, we roll out at 7:05 sharp.",
    cover_image_url: null,
    cover_gradient: "linear-gradient(135deg, #2AD472 0%, #1fc262 30%, #0C5DE9 70%, #093fb0 100%)",
    group_id: sundayRunners.id,
    open_to_join: true,
    booking_url: null,
    activity_type: "Running",
  },
  {
    id: "w-bouldering",
    title: "VITAL bouldering sesh",
    start_time: daysFromNow(2, 18, 30),
    location: "VITAL Climbing Gym, Williamsburg",
    host: finn,
    cohosts: [],
    participants: [finn, kyrah, tye],
    participant_cap: 8,
    description: "Working V5-V7 problems this week. Bring shoes or rent at the desk. Cool-down beers at the bar after.",
    cover_image_url: null,
    cover_gradient: "linear-gradient(135deg, #9A5AF0 0%, #7a3dd4 30%, #5b3d8f 60%, #3d2860 100%)",
    group_id: climbCrew.id,
    open_to_join: true,
    booking_url: null,
    activity_type: "Climbing",
  },
  {
    id: "w-peloton",
    title: "6 AM Peloton ride",
    start_time: daysFromNow(3, 6, 0),
    location: "Peloton Studios, Hudson Yards",
    host: kiera,
    cohosts: [luke],
    participants: [kiera, luke, brandon, tye, CURRENT_USER],
    participant_cap: 30,
    description: "Cody Rigsby live class. Get there 15 min early to clip in. Energy matching required.",
    cover_image_url: null,
    cover_gradient: "linear-gradient(135deg, #2AD472 0%, #22b85f 30%, #4a8f6f 60%, #1a6b4a 100%)",
    group_id: cycleCrew.id,
    open_to_join: true,
    booking_url: "https://www.onepeloton.com/schedule/cycling",
    activity_type: "Cycling",
  },
  {
    id: "w-yoga",
    title: "Vinyasa flow @ Sky Ting",
    start_time: daysFromNow(4, 12, 0),
    location: "Sky Ting Yoga, Tribeca",
    host: kyrah,
    cohosts: [],
    participants: [kyrah, kiera, CURRENT_USER],
    participant_cap: 15,
    description: "Noon flow with Krissy. Bring your own mat or borrow one. Restorative vibes.",
    cover_image_url: null,
    cover_gradient: "linear-gradient(135deg, #9A5AF0 0%, #b07af5 30%, #c39cff 60%, #7a3dd4 100%)",
    group_id: null,
    open_to_join: true,
    booking_url: null,
    activity_type: "Yoga",
  },
  {
    id: "w-past-lift",
    title: "Upper body push day",
    start_time: daysAgo(2, 17, 0),
    location: "Equinox, Flatiron",
    host: danny,
    cohosts: [],
    participants: [danny, brandon, CURRENT_USER],
    participant_cap: null,
    description: "Bench, OHP, dips, and cable flys. 75-minute session. Bring your lifting shoes.",
    cover_image_url: null,
    cover_gradient: "linear-gradient(135deg, #0C5DE9 0%, #0A4FC5 30%, #083da0 60%, #062d7a 100%)",
    group_id: null,
    open_to_join: false,
    booking_url: null,
    activity_type: "Strength",
  },
];

// Wire up group → upcoming workouts
cycleCrew.upcoming_workouts = MOCK_WORKOUTS.filter(
  (w) => w.group_id === cycleCrew.id && new Date(w.start_time) > new Date(),
);
sundayRunners.upcoming_workouts = MOCK_WORKOUTS.filter(
  (w) => w.group_id === sundayRunners.id && new Date(w.start_time) > new Date(),
);
climbCrew.upcoming_workouts = MOCK_WORKOUTS.filter(
  (w) => w.group_id === climbCrew.id && new Date(w.start_time) > new Date(),
);

// ----------------------------------------------------------------
// Notifications
// ----------------------------------------------------------------

// TODO: replace with notifications RPC
export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: "n1",
    type: "rsvp_yes",
    actor: finn,
    target_workout: MOCK_WORKOUTS[0],
    created_at: daysAgo(0, 14, 22),
    unread: true,
  },
  {
    id: "n2",
    type: "workout_invite",
    actor: luke,
    target_workout: MOCK_WORKOUTS[0],
    created_at: daysAgo(0, 10, 5),
    unread: true,
  },
  {
    id: "n3",
    type: "friend_request",
    actor: charles,
    created_at: daysAgo(1, 9, 30),
    unread: true,
  },
  {
    id: "n4",
    type: "group_invite",
    actor: michael,
    target_group: sundayRunners,
    created_at: daysAgo(1, 8, 0),
    unread: false,
  },
  {
    id: "n5",
    type: "rsvp_yes",
    actor: kyrah,
    target_workout: MOCK_WORKOUTS[2],
    created_at: daysAgo(2, 16, 45),
    unread: false,
  },
  {
    id: "n6",
    type: "workout_reminder",
    actor: CURRENT_USER,
    target_workout: MOCK_WORKOUTS[1],
    created_at: daysAgo(0, 6, 0),
    unread: true,
  },
  {
    id: "n7",
    type: "rsvp_maybe",
    actor: brandon,
    target_workout: MOCK_WORKOUTS[3],
    created_at: daysAgo(2, 20, 10),
    unread: false,
  },
  {
    id: "n8",
    type: "rsvp_yes",
    actor: tye,
    target_workout: MOCK_WORKOUTS[2],
    created_at: daysAgo(3, 11, 0),
    unread: false,
  },
];

// ----------------------------------------------------------------
// Recommendations
// ----------------------------------------------------------------

// TODO: replace with recommendation engine RPC
export const MOCK_RECOMMENDATIONS: MockRecommendation[] = [
  {
    workout: MOCK_WORKOUTS[1],
    reason: "Sunday runners \u00b7 3 friends going",
  },
  {
    workout: MOCK_WORKOUTS[2],
    reason: "Finn posted in Climb crew",
  },
  {
    workout: MOCK_WORKOUTS[3],
    reason: "You\u2019re in Cycle crew",
  },
  {
    workout: MOCK_WORKOUTS[4],
    reason: "Kyrah is hosting near you",
  },
];

// ----------------------------------------------------------------
// Invites (pending response from current user)
// ----------------------------------------------------------------

// TODO: replace with pending invites RPC
export const MOCK_INVITES: MockWorkout[] = [
  MOCK_WORKOUTS[0], // Good Saturdays
  MOCK_WORKOUTS[3], // Peloton ride
];

// ----------------------------------------------------------------
// Dashboard-specific data
// ----------------------------------------------------------------

export const USER_STATS = {
  friends: 42,
  groups: 4,
  workouts_this_month: 16,
};

export const FRIEND_REQUESTS_COUNT: number = 2;

export const DISCOVERABLE_FRIENDS = {
  count: 14,
  preview_avatars: [finn, kyrah],
};

// ----------------------------------------------------------------
// Activity cover photos (Unsplash)
// ----------------------------------------------------------------

export const ACTIVITY_COVER_PHOTOS: Record<string, string> = {
  Running: "https://images.unsplash.com/photo-1486218119243-13883505764c?w=600&q=80&auto=format&fit=crop",
  Cycling: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80&auto=format&fit=crop",
  Climbing: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=600&q=80&auto=format&fit=crop",
  Yoga: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&q=80&auto=format&fit=crop",
  Strength: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80&auto=format&fit=crop",
  HIIT: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80&auto=format&fit=crop",
  Track: "https://images.unsplash.com/photo-1502904550040-7534597429ae?w=600&q=80&auto=format&fit=crop",
  Walking: "https://images.unsplash.com/photo-1502163140606-888448ae8cfe?w=600&q=80&auto=format&fit=crop",
  Boxing: "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=600&q=80&auto=format&fit=crop",
  Basketball: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80&auto=format&fit=crop",
};

export function coverPhotoForActivity(activity: string): string {
  return ACTIVITY_COVER_PHOTOS[activity] ?? ACTIVITY_COVER_PHOTOS["Running"];
}
