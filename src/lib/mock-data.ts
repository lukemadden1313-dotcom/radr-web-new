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
  birthday_month?: string;
  joined_at?: string;
  bio?: string;
  parties_attended?: number;
  hosted_count?: number;
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
  birthday_month: "August",
  joined_at: "2024-07-15T00:00:00Z",
  parties_attended: 19,
  hosted_count: 4,
};

export const MOCK_FRIENDS: MockUser[] = [
  {
    id: "u-luke",
    full_name: "Luke Madden",
    username: "lukemadden",
    avatar_url: null,
    initials: "LM",
    gradient_seed: "L",
    birthday_month: "March",
    joined_at: "2024-06-01T00:00:00Z",
    parties_attended: 31,
    hosted_count: 8,
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
    birthday_month: "November",
    joined_at: "2024-08-20T00:00:00Z",
    parties_attended: 22,
    hosted_count: 6,
  },
  {
    id: "u-kyrah",
    full_name: "Kyrah Stewart",
    username: "kkrysp",
    avatar_url: null,
    initials: "KS",
    gradient_seed: "K",
    birthday_month: "January",
    joined_at: "2024-09-10T00:00:00Z",
    parties_attended: 14,
    hosted_count: 3,
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
  // --- Additional workouts for schedule density ---
  {
    id: "w-today-run",
    title: "Morning shake-out run",
    start_time: daysFromNow(0, 7, 30),
    location: "Hudson River Greenway, Chelsea Piers",
    host: CURRENT_USER,
    cohosts: [],
    participants: [CURRENT_USER, luke, danny],
    participant_cap: null,
    description: "Easy 3-miler along the river. All paces welcome.",
    cover_image_url: null,
    cover_gradient: "linear-gradient(135deg, #2AD472 0%, #1fc262 50%, #0C5DE9 100%)",
    group_id: null,
    open_to_join: true,
    booking_url: null,
    activity_type: "Running",
  },
  {
    id: "w-today-evening",
    title: "Barry's Arms & Abs",
    start_time: daysFromNow(0, 18, 0),
    location: "Barry's Bootcamp, Noho",
    host: kiera,
    cohosts: [],
    participants: [kiera, kyrah, CURRENT_USER, brandon],
    participant_cap: 25,
    description: "50-minute arms and abs class. Bring water.",
    cover_image_url: null,
    cover_gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 50%, #be185d 100%)",
    group_id: null,
    open_to_join: true,
    booking_url: null,
    activity_type: "HIIT",
  },
  {
    id: "w-tomorrow-climb",
    title: "Brooklyn Boulders sesh",
    start_time: daysFromNow(1, 18, 0),
    location: "Brooklyn Boulders, Gowanus",
    host: tye,
    cohosts: [finn],
    participants: [tye, finn, kyrah, CURRENT_USER],
    participant_cap: 6,
    description: "V4-V6 session. Bring chalk.",
    cover_image_url: null,
    cover_gradient: "linear-gradient(135deg, #9A5AF0 0%, #7a3dd4 50%, #5b3d8f 100%)",
    group_id: climbCrew.id,
    open_to_join: true,
    booking_url: null,
    activity_type: "Climbing",
  },
  {
    id: "w-day2-yoga",
    title: "Sunrise flow on the roof",
    start_time: daysFromNow(2, 6, 30),
    location: "1 Hotel Brooklyn Bridge, Rooftop",
    host: kyrah,
    cohosts: [],
    participants: [kyrah, kiera, CURRENT_USER],
    participant_cap: 10,
    description: "Rooftop vinyasa watching the sun come up over Manhattan. BYOM (bring your own mat).",
    cover_image_url: null,
    cover_gradient: "linear-gradient(135deg, #9A5AF0 0%, #b07af5 50%, #c39cff 100%)",
    group_id: null,
    open_to_join: true,
    booking_url: null,
    activity_type: "Yoga",
  },
  // --- Month-spread workouts for schedule grid ---
  {
    id: "w-last-week-run",
    title: "West Side Highway 5K",
    start_time: daysAgo(7, 7, 0),
    location: "Pier 40, Hudson River Park",
    host: michael,
    cohosts: [],
    participants: [michael, CURRENT_USER, danny, jb],
    participant_cap: null,
    description: "Easy 5K along the river path. Meetup at Pier 40.",
    cover_image_url: null,
    cover_gradient: "linear-gradient(135deg, #0C5DE9 0%, #3A7EF2 100%)",
    group_id: sundayRunners.id,
    open_to_join: true,
    booking_url: null,
    activity_type: "Running",
  },
  {
    id: "w-last-week-strength",
    title: "Deadlift day",
    start_time: daysAgo(5, 16, 0),
    location: "Equinox, SoHo",
    host: brandon,
    cohosts: [],
    participants: [brandon, danny, CURRENT_USER],
    participant_cap: null,
    description: "Heavy pulls. Work up to 3RM.",
    cover_image_url: null,
    cover_gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    group_id: null,
    open_to_join: false,
    booking_url: null,
    activity_type: "Strength",
  },
  {
    id: "w-next-week-cycle",
    title: "Citi Bike century attempt",
    start_time: daysFromNow(8, 6, 0),
    location: "Brooklyn Bridge, Manhattan side",
    host: luke,
    cohosts: [finn],
    participants: [luke, finn, CURRENT_USER, brandon, tye],
    participant_cap: null,
    description: "100-mile Citi Bike ride. We're either legends or idiots. Probably both.",
    cover_image_url: null,
    cover_gradient: "linear-gradient(135deg, #2AD472 0%, #1fc262 100%)",
    group_id: cycleCrew.id,
    open_to_join: true,
    booking_url: null,
    activity_type: "Cycling",
  },
  {
    id: "w-next-week-hiit",
    title: "Rumble Boxing 🥊",
    start_time: daysFromNow(9, 18, 30),
    location: "Rumble Boxing, FiDi",
    host: kiera,
    cohosts: [],
    participants: [kiera, kyrah, CURRENT_USER],
    participant_cap: 20,
    description: "Full-body boxing workout. 10 rounds. Gloves provided.",
    cover_image_url: null,
    cover_gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
    group_id: null,
    open_to_join: true,
    booking_url: null,
    activity_type: "HIIT",
  },
  {
    id: "w-mid-month-climb",
    title: "VITAL comp night",
    start_time: daysFromNow(12, 19, 0),
    location: "VITAL Climbing Gym, Williamsburg",
    host: finn,
    cohosts: [tye],
    participants: [finn, tye, kyrah, CURRENT_USER, kiera],
    participant_cap: 12,
    description: "Monthly bouldering comp. All levels. Beer after.",
    cover_image_url: null,
    cover_gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    group_id: climbCrew.id,
    open_to_join: true,
    booking_url: null,
    activity_type: "Climbing",
  },
  {
    id: "w-mid-month-yoga",
    title: "Y7 candlelight flow",
    start_time: daysFromNow(14, 20, 0),
    location: "Y7 Studio, Flatiron",
    host: kyrah,
    cohosts: [],
    participants: [kyrah, kiera, CURRENT_USER],
    participant_cap: 25,
    description: "Hip-hop vinyasa by candlelight. Heated room. Bring a towel.",
    cover_image_url: null,
    cover_gradient: "linear-gradient(135deg, #9A5AF0 0%, #7a3dd4 100%)",
    group_id: null,
    open_to_join: true,
    booking_url: null,
    activity_type: "Yoga",
  },
  {
    id: "w-late-month-run",
    title: "Prospect Park tempo",
    start_time: daysFromNow(18, 6, 30),
    location: "Grand Army Plaza, Prospect Park",
    host: charles,
    cohosts: [michael],
    participants: [charles, michael, danny, CURRENT_USER],
    participant_cap: null,
    description: "5-mile tempo run around the park loop. Pacing for 7:30/mi.",
    cover_image_url: null,
    cover_gradient: "linear-gradient(135deg, #0C5DE9 0%, #093fb0 100%)",
    group_id: sundayRunners.id,
    open_to_join: true,
    booking_url: null,
    activity_type: "Running",
  },
  {
    id: "w-end-month-strength",
    title: "Leg day from hell",
    start_time: daysFromNow(22, 17, 0),
    location: "Equinox, Flatiron",
    host: danny,
    cohosts: [brandon],
    participants: [danny, brandon, CURRENT_USER, luke],
    participant_cap: null,
    description: "Squats, lunges, leg press, calf raises. You've been warned.",
    cover_image_url: null,
    cover_gradient: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
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

// ----------------------------------------------------------------
// Profile helpers
// ----------------------------------------------------------------

export function getUserByUsername(username: string): MockUser | undefined {
  if (username === CURRENT_USER.username) return CURRENT_USER;
  return MOCK_FRIENDS.find((u) => u.username === username);
}

// TODO: replace with get_mutual_friends RPC when backend ready
export function getMutualFriends(otherUser: MockUser): MockUser[] {
  return MOCK_FRIENDS.filter(
    (u) => u.id !== otherUser.id && u.id !== CURRENT_USER.id,
  ).slice(0, 6);
}

// TODO: replace with get_shared_workouts RPC when backend ready
export function getSharedWorkouts(otherUser: MockUser): MockWorkout[] {
  return MOCK_WORKOUTS.filter(
    (w) =>
      w.participants.some((p) => p.id === CURRENT_USER.id) &&
      w.participants.some((p) => p.id === otherUser.id),
  );
}

// TODO: replace with RPC
export function getWorkoutsHostedByUser(user: MockUser): MockWorkout[] {
  return MOCK_WORKOUTS.filter((w) => w.host.id === user.id);
}

// TODO: replace with RPC
export function getWorkoutsUserCouldJoin(otherUser: MockUser): MockWorkout[] {
  const now = new Date();
  return MOCK_WORKOUTS.filter(
    (w) =>
      new Date(w.start_time) >= now &&
      w.participants.some((p) => p.id === otherUser.id) &&
      !w.participants.some((p) => p.id === CURRENT_USER.id),
  );
}

// ----------------------------------------------------------------
// Canonical activity list (from iOS Models.swift)
// ----------------------------------------------------------------

export type Activity = {
  key: string;
  displayName: string;
  icon: string;
};

export const ACTIVITIES: Activity[] = [
  { key: "americanFootball", displayName: "American Football", icon: "\ud83c\udfc8" },
  { key: "archery", displayName: "Archery", icon: "\ud83c\udfaf" },
  { key: "australianFootball", displayName: "Australian Football", icon: "\ud83c\udfc9" },
  { key: "badminton", displayName: "Badminton", icon: "\ud83c\udff8" },
  { key: "barre", displayName: "Barre", icon: "\ud83e\ude70" },
  { key: "baseball", displayName: "Baseball", icon: "\u26be" },
  { key: "basketball", displayName: "Basketball", icon: "\ud83c\udfc0" },
  { key: "bowling", displayName: "Bowling", icon: "\ud83c\udfb3" },
  { key: "boxing", displayName: "Boxing", icon: "\ud83e\udd4a" },
  { key: "climbing", displayName: "Climbing", icon: "\ud83e\uddd7" },
  { key: "cooldown", displayName: "Cooldown", icon: "\ud83e\uddca" },
  { key: "coreTraining", displayName: "Core Training", icon: "\ud83d\udcaa" },
  { key: "cricket", displayName: "Cricket", icon: "\ud83c\udfcf" },
  { key: "crossCountrySkiing", displayName: "Cross Country Skiing", icon: "\u26f7\ufe0f" },
  { key: "crossTraining", displayName: "Cross Training", icon: "\ud83c\udfcb\ufe0f" },
  { key: "curling", displayName: "Curling", icon: "\ud83e\udd4c" },
  { key: "dance", displayName: "Dance", icon: "\ud83d\udc83" },
  { key: "discSports", displayName: "Disc Sports", icon: "\ud83e\udd4f" },
  { key: "downhillSkiing", displayName: "Downhill Skiing", icon: "\u26f7\ufe0f" },
  { key: "elliptical", displayName: "Elliptical", icon: "\ud83c\udfc3" },
  { key: "equestrianSports", displayName: "Equestrian Sports", icon: "\ud83d\udc34" },
  { key: "fencing", displayName: "Fencing", icon: "\ud83e\udd3a" },
  { key: "fishing", displayName: "Fishing", icon: "\ud83c\udfa3" },
  { key: "fitnessGaming", displayName: "Fitness Gaming", icon: "\ud83c\udfae" },
  { key: "flexibility", displayName: "Flexibility", icon: "\ud83e\udd38" },
  { key: "functionalStrength", displayName: "Functional Strength Training", icon: "\ud83c\udfcb\ufe0f" },
  { key: "golf", displayName: "Golf", icon: "\u26f3" },
  { key: "gymnastics", displayName: "Gymnastics", icon: "\ud83e\udd38" },
  { key: "handCycling", displayName: "Hand Cycling", icon: "\ud83d\udeb4" },
  { key: "handball", displayName: "Handball", icon: "\ud83e\udd3e" },
  { key: "hiit", displayName: "High Intensity Interval Training", icon: "\ud83d\udd25" },
  { key: "hike", displayName: "Hiking", icon: "\ud83e\udd7e" },
  { key: "hunting", displayName: "Hunting", icon: "\ud83c\udff9" },
  { key: "hyrox", displayName: "Hyrox", icon: "\ud83d\udcaa" },
  { key: "indoorCycle", displayName: "Indoor Cycle", icon: "\ud83d\udeb4" },
  { key: "indoorHockey", displayName: "Indoor Hockey", icon: "\ud83c\udfd2" },
  { key: "indoorRowing", displayName: "Indoor Rowing", icon: "\ud83d\udea3" },
  { key: "indoorRun", displayName: "Indoor Run", icon: "\ud83c\udfc3" },
  { key: "indoorSkating", displayName: "Indoor Skating", icon: "\u26f8\ufe0f" },
  { key: "indoorSoccer", displayName: "Indoor Soccer", icon: "\u26bd" },
  { key: "indoorWalk", displayName: "Indoor Walk", icon: "\ud83d\udeb6" },
  { key: "jumpRope", displayName: "Jump Rope", icon: "\ud83e\udea2" },
  { key: "kickboxing", displayName: "Kickboxing", icon: "\ud83e\udd4b" },
  { key: "lacrosse", displayName: "Lacrosse", icon: "\ud83e\udd4d" },
  { key: "martialArts", displayName: "Martial Arts", icon: "\ud83e\udd4b" },
  { key: "mindAndBody", displayName: "Mind & Body", icon: "\ud83e\uddd8" },
  { key: "mixedCardio", displayName: "Mixed Cardio", icon: "\u2764\ufe0f" },
  { key: "openWaterSwim", displayName: "Open Water Swim", icon: "\ud83c\udf0a" },
  { key: "outdoorCycle", displayName: "Outdoor Cycle", icon: "\ud83d\udeb4" },
  { key: "outdoorHockey", displayName: "Outdoor Hockey", icon: "\ud83c\udfd2" },
  { key: "outdoorRowing", displayName: "Outdoor Rowing", icon: "\ud83d\udea3" },
  { key: "outdoorRun", displayName: "Outdoor Run", icon: "\ud83c\udfc3" },
  { key: "outdoorSkating", displayName: "Outdoor Skating", icon: "\u26f8\ufe0f" },
  { key: "outdoorSoccer", displayName: "Outdoor Soccer", icon: "\u26bd" },
  { key: "outdoorWalk", displayName: "Outdoor Walk", icon: "\ud83d\udeb6" },
  { key: "padel", displayName: "P\u00e1del", icon: "\ud83c\udfbe" },
  { key: "paddling", displayName: "Paddling", icon: "\ud83d\udef6" },
  { key: "pickleball", displayName: "Pickleball", icon: "\ud83c\udfd3" },
  { key: "pilates", displayName: "Pilates", icon: "\ud83e\udd38" },
  { key: "play", displayName: "Play", icon: "\ud83e\udd3e" },
  { key: "poolSwim", displayName: "Pool Swim", icon: "\ud83c\udfca" },
  { key: "racquetball", displayName: "Racquetball", icon: "\ud83c\udfbe" },
  { key: "rolling", displayName: "Rolling", icon: "\ud83d\udef9" },
  { key: "rugby", displayName: "Rugby", icon: "\ud83c\udfc9" },
  { key: "sailing", displayName: "Sailing", icon: "\u26f5" },
  { key: "snowSports", displayName: "Snow Sports", icon: "\ud83c\udfbf" },
  { key: "snowboarding", displayName: "Snowboarding", icon: "\ud83c\udfc2" },
  { key: "socialDance", displayName: "Social Dance", icon: "\ud83d\udc83" },
  { key: "softball", displayName: "Softball", icon: "\ud83e\udd4e" },
  { key: "squash", displayName: "Squash", icon: "\ud83c\udfbe" },
  { key: "stairs", displayName: "Stairs", icon: "\ud83e\ude9c" },
  { key: "stairStepper", displayName: "Stair Stepper", icon: "\ud83e\ude9c" },
  { key: "stepTraining", displayName: "Step Training", icon: "\ud83e\ude9c" },
  { key: "surfing", displayName: "Surfing", icon: "\ud83c\udfc4" },
  { key: "tableTennis", displayName: "Table Tennis", icon: "\ud83c\udfd3" },
  { key: "taiChi", displayName: "Tai Chi", icon: "\ud83e\uddd8" },
  { key: "tennis", displayName: "Tennis", icon: "\ud83c\udfbe" },
  { key: "trackAndField", displayName: "Track & Field", icon: "\ud83c\udfc3" },
  { key: "traditionalStrength", displayName: "Traditional Strength Training", icon: "\ud83c\udfcb\ufe0f" },
  { key: "volleyball", displayName: "Volleyball", icon: "\ud83c\udfd0" },
  { key: "wrestling", displayName: "Wrestling", icon: "\ud83e\udd3c" },
  { key: "yoga", displayName: "Yoga", icon: "\ud83e\uddd8" },
];

export function getSuggestedActivities(): Activity[] {
  const suggested = ["outdoorRun", "outdoorSoccer", "yoga"];
  return suggested
    .map((key) => ACTIVITIES.find((a) => a.key === key))
    .filter((a): a is Activity => a !== undefined);
}

export function getActivityByKey(key: string): Activity | undefined {
  return ACTIVITIES.find((a) => a.key === key);
}
