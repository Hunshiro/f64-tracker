import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { MockAttempt, LeaderboardUser, UserProfile } from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

// Interface for DB JSON Fallback Schema
interface DatabaseSchema {
  users: Record<string, any>;
  mockAttempts: MockAttempt[];
  leaderboards: LeaderboardUser[];
  streaks: Record<string, { count: number; lastActive: string }>;
}

const DEFAULT_LEADERBOARD: Omit<LeaderboardUser, 'isCurrentUser'>[] = [];

const INITIAL_MOCKS = (userId: string): MockAttempt[] => [
  {
    id: 'm1',
    userId,
    date: '2026-05-10',
    examType: 'SSC CGL',
    platform: 'Testbook',
    mockType: 'Full Length',
    mockNumber: 'Mock CGL - 01',
    score: 135.5,
    overallRank: 3450,
    percentile: 88.5,
    accuracy: 78.4,
    studyHours: 4.5,
    submittedAt: '2026-05-10T14:30:00Z',
    weakTopics: ['Mensurement', 'Inequalities', 'Reading Comprehension', 'Govt Schemes'],
    insights: [
      'Your English score of 42.5 is excellent, but Quant needs revision.',
      'GK accuracy is low (52%), focusing on current schemes will help boost totals.',
    ],
    sectionData: {
      Mathematics: {
        totalMarks: 32.5,
        correctQuestions: 17,
        wrongQuestions: 5,
        unattemptedQuestions: 3,
        accuracy: 77.2,
        timeTaken: 19,
        weakTopics: ['Mensurement', 'Trigonometry'],
        confidenceRating: 3,
        performanceIndicator: 'Medium',
      },
      Reasoning: {
        totalMarks: 41.5,
        correctQuestions: 21,
        wrongQuestions: 2,
        unattemptedQuestions: 2,
        accuracy: 91.3,
        timeTaken: 12,
        weakTopics: ['Inequalities'],
        confidenceRating: 4,
        performanceIndicator: 'Strong',
      },
      English: {
        totalMarks: 42.5,
        correctQuestions: 22,
        wrongQuestions: 3,
        unattemptedQuestions: 0,
        accuracy: 88.0,
        timeTaken: 10,
        weakTopics: ['Reading Comprehension'],
        confidenceRating: 4,
        performanceIndicator: 'Strong',
      },
      GeneralKnowledge: {
        totalMarks: 19.0,
        correctQuestions: 11,
        wrongQuestions: 10,
        unattemptedQuestions: 4,
        accuracy: 52.4,
        timeTaken: 5,
        weakTopics: ['Govt Schemes', 'Modern History'],
        confidenceRating: 2,
        performanceIndicator: 'Weak',
      },
    },
  },
  {
    id: 'm2',
    userId,
    date: '2026-05-15',
    examType: 'SSC CGL',
    platform: 'Oliveboard',
    mockType: 'LIVE',
    mockNumber: 'Live Mock 4',
    score: 142.0,
    overallRank: 1920,
    percentile: 91.2,
    accuracy: 80.5,
    studyHours: 5.0,
    submittedAt: '2026-05-15T18:45:00Z',
    weakTopics: ['Time & Work', 'Syllogism', 'Grammar Rules', 'Geography'],
    insights: [
      'Great improvements in Reasoning! Perfect score achieved in series completion.',
      'GK performance remained stable, but Geography is pulling down averages.',
    ],
    sectionData: {
      Mathematics: {
        totalMarks: 35.0,
        correctQuestions: 18,
        wrongQuestions: 4,
        unattemptedQuestions: 3,
        accuracy: 81.8,
        timeTaken: 21,
        weakTopics: ['Time & Work'],
        confidenceRating: 4,
        performanceIndicator: 'Strong',
      },
      Reasoning: {
        totalMarks: 45.0,
        correctQuestions: 23,
        wrongQuestions: 2,
        unattemptedQuestions: 0,
        accuracy: 92.0,
        timeTaken: 13,
        weakTopics: ['Syllogism'],
        confidenceRating: 5,
        performanceIndicator: 'Strong',
      },
      English: {
        totalMarks: 44.0,
        correctQuestions: 23,
        wrongQuestions: 4,
        unattemptedQuestions: 1,
        accuracy: 85.2,
        timeTaken: 11,
        weakTopics: ['Grammar Rules'],
        confidenceRating: 4,
        performanceIndicator: 'Strong',
      },
      GeneralKnowledge: {
        totalMarks: 18.0,
        correctQuestions: 10,
        wrongQuestions: 8,
        unattemptedQuestions: 7,
        accuracy: 55.6,
        timeTaken: 6,
        weakTopics: ['Geography', 'Polity'],
        confidenceRating: 2,
        performanceIndicator: 'Weak',
      },
    },
  },
  {
    id: 'm3',
    userId,
    date: '2026-05-22',
    examType: 'SSC CGL',
    platform: 'F64 Academy',
    mockType: 'Full Length',
    mockNumber: 'Academy Track - 12',
    score: 154.5,
    overallRank: 642,
    percentile: 96.8,
    accuracy: 84.6,
    studyHours: 6.2,
    submittedAt: '2026-05-22T11:20:00Z',
    weakTopics: ['Algebra', 'Blood Relations', 'Vocabulary', 'Science'],
    insights: [
      'Excellent performance! Highest percentile milestone (96.8%) unlocked.',
      'Quant speed improved. Algebra needs slightly faster solving techniques.',
    ],
    sectionData: {
      Mathematics: {
        totalMarks: 41.0,
        correctQuestions: 21,
        wrongQuestions: 3,
        unattemptedQuestions: 1,
        accuracy: 87.5,
        timeTaken: 18,
        weakTopics: ['Algebra'],
        confidenceRating: 4,
        performanceIndicator: 'Strong',
      },
      Reasoning: {
        totalMarks: 47.5,
        correctQuestions: 24,
        wrongQuestions: 1,
        unattemptedQuestions: 0,
        accuracy: 96.0,
        timeTaken: 11,
        weakTopics: ['Blood Relations'],
        confidenceRating: 5,
        performanceIndicator: 'Strong',
      },
      English: {
        totalMarks: 43.5,
        correctQuestions: 22,
        wrongQuestions: 2,
        unattemptedQuestions: 1,
        accuracy: 91.7,
        timeTaken: 9,
        weakTopics: ['Vocabulary'],
        confidenceRating: 5,
        performanceIndicator: 'Strong',
      },
      GeneralKnowledge: {
        totalMarks: 22.5,
        correctQuestions: 13,
        wrongQuestions: 7,
        unattemptedQuestions: 5,
        accuracy: 65.0,
        timeTaken: 6,
        weakTopics: ['Science', 'Current Affairs'],
        confidenceRating: 3,
        performanceIndicator: 'Medium',
      },
    },
  },
  {
    id: 'm4',
    userId,
    date: '2026-05-27',
    examType: 'SSC CGL',
    platform: 'PracticeMock',
    mockType: 'PYQ',
    mockNumber: 'CGL 2024 tier 1 Shift 2',
    score: 149.0,
    overallRank: 810,
    percentile: 94.3,
    accuracy: 82.1,
    studyHours: 5.5,
    submittedAt: '2026-05-27T09:12:00Z',
    weakTopics: ['Geometry', 'Coding Decoding', 'Synonyms', 'Indian History'],
    insights: [
      'Geometry remains a minor bottleneck despite a strong score core.',
      'Fascinating GK score! Higher accuracy in Indian History seen overall.',
    ],
    sectionData: {
      Mathematics: {
        totalMarks: 37.0,
        correctQuestions: 19,
        wrongQuestions: 4,
        unattemptedQuestions: 2,
        accuracy: 82.6,
        timeTaken: 22,
        weakTopics: ['Geometry'],
        confidenceRating: 3,
        performanceIndicator: 'Medium',
      },
      Reasoning: {
        totalMarks: 46.0,
        correctQuestions: 23,
        wrongQuestions: 1,
        unattemptedQuestions: 1,
        accuracy: 95.8,
        timeTaken: 11,
        weakTopics: ['Coding Decoding'],
        confidenceRating: 5,
        performanceIndicator: 'Strong',
      },
      English: {
        totalMarks: 44.5,
        correctQuestions: 23,
        wrongQuestions: 3,
        unattemptedQuestions: 0,
        accuracy: 88.5,
        timeTaken: 10,
        weakTopics: ['Synonyms'],
        confidenceRating: 4,
        performanceIndicator: 'Strong',
      },
      GeneralKnowledge: {
        totalMarks: 21.5,
        correctQuestions: 12,
        wrongQuestions: 6,
        unattemptedQuestions: 7,
        accuracy: 66.7,
        timeTaken: 6,
        weakTopics: ['Indian History'],
        confidenceRating: 3,
        performanceIndicator: 'Medium',
      },
    },
  },
];

class Database {
  private data!: DatabaseSchema;
  private mongoClient: any = null;
  private mongoDb: any = null;
  private useMongo = false;

  constructor() {
    this.resetSchema();
  }

  private resetSchema() {
    this.data = {
      users: {},
      mockAttempts: [],
      leaderboards: [],
      streaks: {},
    };
  }

  /**
   * Initialize db: Connect to MongoDB optionally if URI is provided, falling back to local JSON
   */
  public async init() {
    // 1. Prepare JSON Fallback Structure
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_PATH)) {
      try {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(fileContent);
      } catch (err) {
        console.error('Error reading db.json, maintaining clean schema', err);
        this.resetSchema();
      }
    } else {
      const demoId = 'u_demo';
      const passwordHash = bcrypt.hashSync('f64academy', 10);
      
      this.data.users[demoId] = {
        id: demoId,
        email: 'prabhanshut67@gmail.com',
        name: 'Prabhanshu',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop',
        passwordHash,
        targetExam: 'SSC CGL',
        primaryPlatform: 'F64 Academy',
        dailyStudyGoal: 6,
        streakCount: 5,
        lastActive: new Date().toISOString(),
      };

      this.data.mockAttempts = [];
      this.recalculateLeaderboardLocal();
      this.data.streaks[demoId] = { count: 5, lastActive: new Date().toISOString() };
      this.saveLocal();
    }

    // 2. Initialize MongoDB connection asynchronously if a valid MONGODB_URI is provided
    const mongoUri = process.env.MONGODB_URI;
    const isValidUri = mongoUri && (mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://'));

    if (isValidUri) {
      console.log('MONGODB_URI located with valid scheme. Connecting to MongoDB server...');
      try {
        const { MongoClient } = await import('mongodb');
        const client = new MongoClient(mongoUri!);
        await client.connect();
        this.mongoClient = client;
        this.mongoDb = client.db(); // Uses default database in URI configuration
        this.useMongo = true;
        console.log('Successfully connected to MongoDB!');

        // Seed default collections if they are empty
        await this.seedMongoIfNeeded();
      } catch (err) {
        console.error('Failed to establish MongoDB connection. Standard file-backed SQLite/JSON logic loaded.', err);
        this.useMongo = false;
      }
    } else {
      console.log('No valid MONGODB_URI provided (must start with "mongodb://" or "mongodb+srv://"). Defaulting to local JSON file database.');
    }

    // 3. Purge existing pre-seeded dummy mocks from both local DB and MongoDB
    console.log('Running real-time migration: Purging any residual dummy mock entries...');
    this.data.mockAttempts = this.data.mockAttempts.filter(m => !['m1', 'm2', 'm3', 'm4'].includes(m.id));
    this.recalculateLeaderboardLocal();
    this.saveLocal();

    if (this.useMongo && this.mongoDb) {
      try {
        const mocksColl = this.mongoDb.collection('mockAttempts');
        const deleteRes = await mocksColl.deleteMany({ id: { $in: ['m1', 'm2', 'm3', 'm4'] } });
        if (deleteRes.deletedCount > 0) {
          console.log(`Migration: Purged ${deleteRes.deletedCount} pre-seeded dummy mock records from MongoDB.`);
        }
      } catch (err) {
        console.error('Failed to run migration hook to purge MongoDB dummy mocks:', err);
      }
    }
  }

  private async seedMongoIfNeeded() {
    if (!this.useMongo || !this.mongoDb) return;
    try {
      const usersColl = this.mongoDb.collection('users');
      const mocksColl = this.mongoDb.collection('mockAttempts');
      const streaksColl = this.mongoDb.collection('streaks');

      const userCount = await usersColl.countDocuments();
      if (userCount === 0) {
        console.log('Seeding MongoDB with demo configurations...');
        const demoId = 'u_demo';
        const passwordHash = bcrypt.hashSync('f64academy', 10);
        
        const demoUser = {
          id: demoId,
          email: 'prabhanshut67@gmail.com',
          name: 'Prabhanshu',
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop',
          passwordHash,
          targetExam: 'SSC CGL',
          primaryPlatform: 'F64 Academy',
          dailyStudyGoal: 6,
          streakCount: 5,
          lastActive: new Date().toISOString(),
        };

        await usersColl.insertOne(demoUser);

        const initialStreak = { userId: demoId, count: 5, lastActive: new Date().toISOString() };
        await streaksColl.insertOne(initialStreak);
        
        console.log('MongoDB successfully seeded with default demo credentials.');
      }
    } catch (err) {
      console.error('Error seeding MongoDB collections:', err);
    }
  }

  // Auth operations
  public async findUserByEmail(email: string) {
    if (this.useMongo && this.mongoDb) {
      return await this.mongoDb.collection('users').findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    }
    return Object.values(this.data.users).find((user: any) => user.email.toLowerCase() === email.toLowerCase());
  }

  public async findUserById(id: string) {
    if (this.useMongo && this.mongoDb) {
      return await this.mongoDb.collection('users').findOne({ id });
    }
    return this.data.users[id];
  }

  public async registerUser(email: string, name: string, passwordHash: string, targetExam: string = 'SSC CGL', primaryPlatform: string = 'F64 Academy', avatar?: string) {
    const userId = 'u_' + Math.random().toString(36).substring(2, 11);
    const user = {
      id: userId,
      email,
      name,
      avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
      passwordHash,
      targetExam,
      primaryPlatform,
      dailyStudyGoal: 5,
      streakCount: 1,
      lastActive: new Date().toISOString(),
    };

    if (this.useMongo && this.mongoDb) {
      await this.mongoDb.collection('users').insertOne(user);
      await this.mongoDb.collection('streaks').insertOne({ userId, count: 1, lastActive: new Date().toISOString() });
      return user;
    }

    this.data.users[userId] = user;
    this.data.streaks[userId] = { count: 1, lastActive: new Date().toISOString() };
    this.recalculateLeaderboardLocal();
    this.saveLocal();
    return user;
  }

  public async updateUser(id: string, updates: Partial<UserProfile>) {
    if (this.useMongo && this.mongoDb) {
      await this.mongoDb.collection('users').updateOne({ id }, { $set: updates });
      return await this.findUserById(id);
    }

    if (this.data.users[id]) {
      this.data.users[id] = { ...this.data.users[id], ...updates };
      this.recalculateLeaderboardLocal();
      this.saveLocal();
      return this.data.users[id];
    }
    return null;
  }

  // Mock attempts
  public async getMocks(userId: string) {
    if (this.useMongo && this.mongoDb) {
      const docs = await this.mongoDb.collection('mockAttempts').find({ userId }).toArray();
      return docs.map((d: any) => {
        const { _id, ...rest } = d;
        return rest;
      }).sort((a: any, b: any) => b.date.localeCompare(a.date));
    }
    return this.data.mockAttempts.filter(m => m.userId === userId).sort((a,b) => b.date.localeCompare(a.date));
  }

  public async addMockAttempt(userId: string, attempt: Omit<MockAttempt, 'id' | 'userId' | 'submittedAt' | 'insights'>) {
    const id = 'm_' + Math.random().toString(36).substring(2, 11);
    
    // Insights generator
    const insights: string[] = [];
    const { Mathematics, Reasoning, English, GeneralKnowledge } = attempt.sectionData;
    
    if (Reasoning.accuracy > Mathematics.accuracy + 10) {
      insights.push(`Your Reasoning accuracy is excellent (${Reasoning.accuracy}%), but Mathematics is trailing at ${Mathematics.accuracy}%. Try allocating slightly more time to math sectional practices.`);
    }
    if (GeneralKnowledge.accuracy < 55) {
      insights.push('General Knowledge accuracy falls below 55%. Revise previous year questions (PYQs) rather than memorizing vast new segments.');
    }
    if (attempt.score > 155) {
      insights.push('Excellent scoring power! You are performing in the top tier. Keep practicing live mock runs to master your exam pacing.');
    } else if (attempt.score < 120) {
      insights.push('Focus on fundamental concepts first. Work on English vocabulary lists and Reasoning analogies to boost the low-hanging fruit.');
    }

    if (Mathematics.weakTopics.length > 0) {
      insights.push(`Weak topic detected: consistently losing marks in ${Mathematics.weakTopics.join(', ')}.`);
    }

    const fullAttempt: MockAttempt = {
      ...attempt,
      id,
      userId,
      insights,
      submittedAt: new Date().toISOString(),
    };

    if (this.useMongo && this.mongoDb) {
      await this.mongoDb.collection('mockAttempts').insertOne(fullAttempt);
      await this.updateUserStreakMongo(userId);
      return fullAttempt;
    }

    this.data.mockAttempts.push(fullAttempt);
    this.updateUserStreakLocal(userId);
    this.recalculateLeaderboardLocal();
    this.saveLocal();
    return fullAttempt;
  }

  public async deleteMockAttempt(userId: string, mockId: string) {
    if (this.useMongo && this.mongoDb) {
      const res = await this.mongoDb.collection('mockAttempts').deleteOne({ userId, id: mockId });
      return res.deletedCount > 0;
    }

    const lenBefore = this.data.mockAttempts.length;
    this.data.mockAttempts = this.data.mockAttempts.filter(m => !(m.userId === userId && m.id === mockId));
    
    if (this.data.mockAttempts.length !== lenBefore) {
      this.recalculateLeaderboardLocal();
      this.saveLocal();
      return true;
    }
    return false;
  }

  // Streaks helpers
  private updateUserStreakLocal(userId: string) {
    const streakObj = this.data.streaks[userId];
    const todayStr = new Date().toISOString().split('T')[0];
    const user = this.data.users[userId];
    
    if (!streakObj) {
      this.data.streaks[userId] = { count: 1, lastActive: todayStr };
      if (user) user.streakCount = 1;
    } else {
      const lastActiveDate = streakObj.lastActive.split('T')[0];
      if (lastActiveDate !== todayStr) {
        const dateL = new Date(lastActiveDate);
        const dateT = new Date(todayStr);
        const diffDays = Math.ceil((dateT.getTime() - dateL.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          streakObj.count += 1;
        } else if (diffDays > 1) {
          streakObj.count = 1;
        }
        streakObj.lastActive = todayStr;
        if (user) {
          user.streakCount = streakObj.count;
          user.lastActive = todayStr;
        }
      }
    }
  }

  private async updateUserStreakMongo(userId: string) {
    if (!this.useMongo || !this.mongoDb) return;
    try {
      const streaksColl = this.mongoDb.collection('streaks');
      const usersColl = this.mongoDb.collection('users');

      const streakObj = await streaksColl.findOne({ userId });
      const todayStr = new Date().toISOString().split('T')[0];

      if (!streakObj) {
        await streaksColl.insertOne({ userId, count: 1, lastActive: todayStr });
        await usersColl.updateOne({ id: userId }, { $set: { streakCount: 1, lastActive: todayStr } });
      } else {
        const lastActiveDate = streakObj.lastActive.split('T')[0];
        if (lastActiveDate !== todayStr) {
          const dateL = new Date(lastActiveDate);
          const dateT = new Date(todayStr);
          const diffDays = Math.ceil((dateT.getTime() - dateL.getTime()) / (1000 * 60 * 60 * 24));
          
          let newCount = streakObj.count;
          if (diffDays === 1) {
            newCount += 1;
          } else if (diffDays > 1) {
            newCount = 1;
          }

          await streaksColl.updateOne({ userId }, { $set: { count: newCount, lastActive: todayStr } });
          await usersColl.updateOne({ id: userId }, { $set: { streakCount: newCount, lastActive: todayStr } });
        }
      }
    } catch (err) {
      console.error('Failed to update streak count inside MongoDB:', err);
    }
  }

  // Leaderboard Calculation
  public async getLeaderboard() {
    if (this.useMongo && this.mongoDb) {
      return await this.getLeaderboardMongo();
    }
    return this.getLeaderboardLocal();
  }

  private getLeaderboardLocal() {
    this.recalculateLeaderboardLocal();
    return this.data.leaderboards;
  }

  private recalculateLeaderboardLocal() {
    const userStatsMap: Record<string, { totalMocks: number; sumScore: number; maxScore: number; sumPercentile: number; sumAccuracy: number }> = {};
    
    this.data.mockAttempts.forEach(mock => {
      if (!userStatsMap[mock.userId]) {
        userStatsMap[mock.userId] = { totalMocks: 0, sumScore: 0, maxScore: 0, sumPercentile: 0, sumAccuracy: 0 };
      }
      const u = userStatsMap[mock.userId];
      u.totalMocks += 1;
      u.sumScore += mock.score;
      u.maxScore = Math.max(u.maxScore, mock.score);
      u.sumPercentile += mock.percentile;
      u.sumAccuracy += mock.accuracy;
    });

    const usersInLeaderboard = Object.keys(this.data.users).map(uid => {
      const profile = this.data.users[uid];
      const stats = userStatsMap[uid] || { totalMocks: 0, sumScore: 0, maxScore: 0, sumPercentile: 0, sumAccuracy: 0 };
      
      const avgScore = stats.totalMocks > 0 ? Number((stats.sumScore / stats.totalMocks).toFixed(1)) : 0;
      const avgPercentile = stats.totalMocks > 0 ? Number((stats.sumPercentile / stats.totalMocks).toFixed(1)) : 0;
      const accuracy = stats.totalMocks > 0 ? Number((stats.sumAccuracy / stats.totalMocks).toFixed(1)) : 0;
      
      let badge = undefined;
      if (stats.totalMocks >= 5 && avgScore > 150) badge = '👑 Grandmaster Scholar';
      else if (stats.totalMocks >= 3 && avgPercentile > 90) badge = '⚡ Fast-Track Star';
      
      return {
        userId: uid,
        name: profile.name,
        avatar: profile.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.name}`,
        totalMocks: stats.totalMocks,
        avgScore,
        avgPercentile,
        accuracy,
        dailyStreak: profile.streakCount || 1,
        achievementBadge: badge
      };
    });

    const sortedArena = usersInLeaderboard
      .sort((a,b) => b.avgScore - a.avgScore)
      .map((item, idx) => ({
        rank: idx + 1,
        ...item
      }));

    this.data.leaderboards = sortedArena;
    
    sortedArena.forEach(pos => {
      if (this.data.users[pos.userId]) {
        this.data.users[pos.userId].currentRank = pos.rank;
      }
    });
  }

  private async getLeaderboardMongo() {
    if (!this.useMongo || !this.mongoDb) return [];
    
    try {
      const usersColl = this.mongoDb.collection('users');
      const mocksColl = this.mongoDb.collection('mockAttempts');

      const allUsers = await usersColl.find({}).toArray();
      const allMocks = await mocksColl.find({}).toArray();

      const userStatsMap: Record<string, { totalMocks: number; sumScore: number; maxScore: number; sumPercentile: number; sumAccuracy: number }> = {};
      
      allMocks.forEach(mock => {
        if (!userStatsMap[mock.userId]) {
          userStatsMap[mock.userId] = { totalMocks: 0, sumScore: 0, maxScore: 0, sumPercentile: 0, sumAccuracy: 0 };
        }
        const u = userStatsMap[mock.userId];
        u.totalMocks += 1;
        u.sumScore += mock.score;
        u.maxScore = Math.max(u.maxScore, mock.score);
        u.sumPercentile += mock.percentile;
        u.sumAccuracy += mock.accuracy;
      });

      const usersInLeaderboard = allUsers.map(profile => {
        const uid = profile.id;
        const stats = userStatsMap[uid] || { totalMocks: 0, sumScore: 0, maxScore: 0, sumPercentile: 0, sumAccuracy: 0 };
        
        const avgScore = stats.totalMocks > 0 ? Number((stats.sumScore / stats.totalMocks).toFixed(1)) : 0;
        const avgPercentile = stats.totalMocks > 0 ? Number((stats.sumPercentile / stats.totalMocks).toFixed(1)) : 0;
        const accuracy = stats.totalMocks > 0 ? Number((stats.sumAccuracy / stats.totalMocks).toFixed(1)) : 0;
        
        let badge = undefined;
        if (stats.totalMocks >= 5 && avgScore > 150) badge = '👑 Grandmaster Scholar';
        else if (stats.totalMocks >= 3 && avgPercentile > 90) badge = '⚡ Fast-Track Star';
        
        return {
          userId: uid,
          name: profile.name,
          avatar: profile.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.name}`,
          totalMocks: stats.totalMocks,
          avgScore,
          avgPercentile,
          accuracy,
          dailyStreak: profile.streakCount || 1,
          achievementBadge: badge
        };
      });

      const allRegisteredIds = new Set(allUsers.map(u => u.id));
      const sortedArena = usersInLeaderboard
        .sort((a, b) => b.avgScore - a.avgScore)
        .map((item, idx) => ({
          rank: idx + 1,
          ...item
        }));

      // Cache ranking details back on elements async
      for (const pos of sortedArena) {
        if (allRegisteredIds.has(pos.userId)) {
          await usersColl.updateOne({ id: pos.userId }, { $set: { currentRank: pos.rank } });
        }
      }

      return sortedArena;
    } catch (err) {
      console.error('Failed to compute competitive leaderboards on MongoDB:', err);
      return [];
    }
  }

  private saveLocal() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to preserve JSON database fallback state:', err);
    }
  }
}

export const db = new Database();
