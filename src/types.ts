export interface MathProblem {
  question: string;
  answer: number;
}

export type RingtoneOption =
  | 'sunrise_melody'
  | 'gentle_morning'
  | 'classic'
  | 'siren'
  | 'military'
  | 'zen'
  | 'buzz_badshah'
  | 'phone_custom';

export interface AlarmConfig {
  enabled: boolean;
  time: string; // "HH:MM" format
  label?: string;
  isTriggered: boolean;
  wakeUpHistory: {
    id: string;
    date: string;
    solvedProblem: string;
    verificationType?: 'selfie' | 'math' | 'selfie_and_math';
    snapshotUrl?: string;
  }[];
  ringtone: RingtoneOption;
  customRingtoneBase64?: string; // Optional custom audio base64 loaded from phone
  voiceVerificationEnabled?: boolean;
  voicePassphrase?: string;
  challengeType?: 'standing_selfie' | 'selfie_and_math' | 'math' | 'reading_typing';
  escalationEnabled?: boolean;
  backgroundGuardEnabled?: boolean;
  lastDismissedDate?: string; // YYYY-MM-DD local date when alarm was verified & dismissed
  triggeredAt?: number;
}

export interface HabitItem {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  text?: string;
  checked?: boolean;
  streak?: number;
}

export interface WaterTracker {
  count: number;
  goal: number;
}

export interface ChallengeItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  completedDays: string[]; // List of YYYY-MM-DD date strings
  title?: string;
  completed?: boolean;
  durationType?: '7' | '10' | '21' | '30' | '60' | 'custom';
  goals?: string[];
  habits?: string[];
  milestones?: { id: string; title: string; dayIndex: number; achieved: boolean }[];
  rewards?: string[];
  achievements?: string[];
  dailyTasks?: { id: string; text: string; completedDays: string[] }[]; // tasks completed on specific YYYY-MM-DD dates
  xpAwarded?: number;
  integratedWaterGoal?: boolean;
  integratedHabitsGoal?: boolean;
  integratedFaithGoal?: boolean;
  integratedCameraGoal?: boolean;
  integratedAlarmGoal?: boolean;
}

export interface PhotoEntry {
  id: string;
  date: string; // YYYY-MM-DD
  imageBase64: string;
  caption?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  category?: 'shopping' | 'todo';
}

export interface GratitudeEntry {
  id: string;
  date: string;
  content: string;
}

export interface FaithTracker {
  fajr: boolean;
  zohor: boolean;
  achr: boolean;
  magrib: boolean;
  esha: boolean;
  tahajjud: boolean;
  ishraq: boolean;
  quranPlayed: boolean;
  quranPages: number;
  dhikrCount: number;
  dhikrTarget: number;
  adhkarMorningCompleted: string[]; // IDs of completed morning adhkar
  adhkarEveningCompleted: string[]; // IDs of completed evening adhkar
  sunnahCompleted: string[]; // List of completed Sunnah IDs for today
  gratitudeJournal: GratitudeEntry[];
  goodDeedsCompleted: string[]; // List of completed Good Deed IDs for today
  imanPoints: number;
  prayers?: any;
}

export interface SocialProfile {
  id: string; // 'tiktok' | 'instagram' | 'youtube' | 'facebook'
  enabled: boolean;
  profileUrl: string;
  niche: string;
  followers?: number;
  totalViews?: number;
  totalLikes?: number;
  avgEngagementRate?: number;
  weeklyGrowth?: number;
  avgRetentionRate?: number;
  recentVideos?: {
    id: string;
    title: string;
    views: number;
    likes: number;
    retention: number;
    growthAnalysis: string;
  }[];
  factualData?: {
    handle?: string;
    titleOrName?: string;
    idOrName?: string;
    linkType?: 'profile' | 'video' | 'page' | 'post' | 'channel' | 'unknown';
    scrapingAttempted?: boolean;
    scrapingStatus?: 'success' | 'partial' | 'blocked_by_auth';
    ogTitle?: string;
    ogDescription?: string;
    availableFields?: string[];
    unavailableFields?: { field: string; reason: string }[];
    frequencyText?: string;
    categoriesText?: string;
    growthTrendsText?: string;
  };
  aiCoachReport?: {
    strengths?: string;
    weaknesses?: string;
    opportunities?: string;
    roadMap?: string[];
    videoRecommendations?: string;
    categories?: string[];
    frequency?: string;
    pillars?: string[];
    hooks?: string[];
    mistakes?: string[];
    engagementTips?: string;
  };
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: string;
  coverUrl?: string;
  genre: string;
}

export interface LoveTarget {
  id: string;
  name: string;
  status: 'girlfriend' | 'crush' | 'soulmate';
  hobbies: string;
  likes: string;
  dislikes: string;
  birthday: string;
  details: string;
  photoBase64?: string;
  videoUrl?: string; // Optional links or video details
}

export interface UserProfileInfo {
  name: string;
  fatherName?: string;
  numberId: string;
  username?: string;
  email?: string;
  accountId?: string;
  avatarBase64: string;
  avatarUrl?: string;
  isLead: boolean;
  bio?: string; // Optional instagram-style bio
}

export interface AppState {
  alarm: AlarmConfig;
  habits: HabitItem[];
  water: WaterTracker;
  challenges: ChallengeItem[];
  photoJournal: {
    duration: 30 | 60 | 90;
    photos: PhotoEntry[];
  };
  notes: NoteItem[];
  todos: TodoItem[];
  faith: FaithTracker;
  loveList: LoveTarget[];
  socialProfiles?: SocialProfile[];
  userProfile?: UserProfileInfo;
}

export type DreamDayStatus = 'completed' | 'modified' | 'missed' | 'pending';

export interface DreamDayActivity {
  id: string;
  startTime?: string; // Optional planned "06:00"
  endTime?: string;   // Optional planned "07:00"
  title: string;
  description?: string;
  category?: string;
  color?: string;
  visionImageUrl?: string;   // Aesthetic Pinterest / vision image
  personalPhotoUrl?: string; // Personal real-life photo of doing the activity
  mediaUrl?: string;         // Backwards compatibility
  mediaType?: 'image' | 'video';
  completedAt?: string;      // Recorded live completion time e.g. "02:45 PM"
  isCustomTask?: boolean;
}

export interface DreamDayActivityStatus {
  status: DreamDayStatus;
  modifiedNote?: string;
  personalPhotoUrl?: string; // Daily real-life snap for this activity
  updatedAt?: string;
  completedAt?: string;      // Recorded live completion time when ticked e.g. "02:45 PM"
}
