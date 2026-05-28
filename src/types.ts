/**
 * Shared Type Definitions for F64 Academy Mock Tracker
 */

export type ExamType = 'SSC CGL' | 'CHSL' | 'MTS' | 'CPO' | 'Other';

export type PlatformName = 'Oliveboard' | 'Testbook' | 'PracticeMock' | 'RBE' | 'F64 Academy';

export type MockType = 'LIVE' | 'PYQ' | 'Full Length' | 'Sectional';

export type PerformanceIndicator = 'Strong' | 'Medium' | 'Weak';

export interface SectionMetrics {
  totalMarks: number;
  correctQuestions: number;
  wrongQuestions: number;
  unattemptedQuestions: number;
  accuracy: number; // calculated
  timeTaken: number; // in minutes
  weakTopics: string[];
  confidenceRating: number; // 1 to 5
  performanceIndicator: PerformanceIndicator;
}

export interface SectionData {
  Mathematics: SectionMetrics;
  Reasoning: SectionMetrics;
  English: SectionMetrics;
  GeneralKnowledge: SectionMetrics;
}

export interface MockAttempt {
  id: string;
  userId: string;
  date: string;
  examType: ExamType;
  platform: PlatformName;
  mockType: MockType;
  mockNumber: string;
  score: number;
  overallRank: number;
  percentile: number;
  accuracy: number;
  studyHours: number;
  sectionData: SectionData;
  weakTopics: string[];
  insights: string[];
  submittedAt: string;
}

export interface WeakTopicStat {
  topic: string;
  subject: keyof SectionData;
  mistakesCount: number;
  frequency: number;
  accuracy: number;
  classification: PerformanceIndicator;
  improvementTrend: 'improving' | 'stable' | 'declining';
}

export interface LeaderboardUser {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  totalMocks: number;
  avgScore: number;
  avgPercentile: number;
  accuracy: number;
  dailyStreak: number;
  achievementBadge?: string;
  isCurrentUser?: boolean;
}

export interface StudyGoal {
  subject: keyof SectionData | 'Overall';
  targetHours: number;
  completedHours: number;
  timeLeftDays: number;
}

export interface UserStats {
  totalMocks: number;
  avgScore: number;
  highestScore: number;
  avgPercentile: number;
  currentRank: number;
  avgAccuracy: number;
  totalStudyHours: number;
  strongestSubject: keyof SectionData | 'N/A';
  weakestSubject: keyof SectionData | 'N/A';
  dailyStreak: number;
  mockHistory: MockAttempt[];
  achievements: {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: string;
  }[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  targetExam: ExamType;
  primaryPlatform: PlatformName;
  dailyStudyGoal: number; // hours
  streakCount: number;
  lastActive: string;
  passwordLastUpdated?: string;
}
