import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db } from './server/db';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'f64_academy_mock_tracker_secret_token_jwt';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Initialize Cloudinary lazily
let isCloudinaryConfigured = false;
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    isCloudinaryConfigured = true;
    console.log('Cloudinary client initialized successfully.');
  } catch (error) {
    console.error('Failed to configure Cloudinary:', error);
  }
} else {
  console.log('Cloudinary environment variables not set. File uploads will fallback to direct base64 strings.');
}

// Initialize server-side Gemini client
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log('Gemini client initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Gemini client:', error);
  }
}

// Authentication Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired session token.' });
    }
    req.user = user;
    next();
  });
}

// Socket.IO Notifications
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);
  
  // Send welcome event
  socket.emit('announcement', {
    message: 'Welcome to F64 Academy real-time live performance tracker! Competitors are active.',
    timestamp: new Date().toISOString()
  });

  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// Broadcast helper
function broadcastUpdate(type: string, data: any) {
  io.emit('realtimeUpdate', { type, data, timestamp: new Date().toISOString() });
}

// ================= AUTH ENDPOINTS =================

// Cloudinary / File upload proxy helper
app.post('/api/upload', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'No image data provided.' });
    }

    if (isCloudinaryConfigured) {
      console.log('Uploading avatar image to Cloudinary...');
      const uploadRes = await cloudinary.uploader.upload(image, {
        folder: 'f64_mock_tracker_profiles',
        transformation: [
          { width: 200, height: 200, crop: 'thumb', gravity: 'face' }
        ]
      });
      console.log('Cloudinary successfully uploaded avatar:', uploadRes.secure_url);
      return res.json({ url: uploadRes.secure_url });
    } else {
      console.log('Cloudinary not configured. Storing/using image directly...');
      // If it is a base64 string, use it directly (it is already downscaled on the client side)
      if (image.startsWith('data:image/')) {
        return res.json({ 
          url: image, 
          info: 'Using local Base64 fallback (Cloudinary credentials missing).' 
        });
      } else {
        const fallbackUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${Math.round(Math.random() * 1000)}`;
        return res.json({ 
          url: fallbackUrl, 
          info: 'Image missing or corrupted. Fallback loaded.' 
        });
      }
    }
  } catch (err: any) {
    console.error('Upload handler exception:', err);
    res.status(500).json({ error: 'Failed to process visual asset: ' + (err.message || err) });
  }
});

// Register
app.post('/api/auth/register', async (req, res) => {
  const { email, name, password, targetExam, primaryPlatform, avatar } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ error: 'Please provide email, name, and password.' });
  }

  const existing = await db.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'A user with this email already exists.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = await db.registerUser(email, name, passwordHash, targetExam, primaryPlatform, avatar);
  const token = jwt.sign({ key: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  // Broadcast to leaderboard that a new candidate joined
  broadcastUpdate('userJoined', { name: user.name });

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, targetExam: user.targetExam, primaryPlatform: user.primaryPlatform, streakCount: user.streakCount } });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter both email and password.' });
  }

  const user = await db.findUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Update streak if active
  const token = jwt.sign({ key: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  await db.updateUser(user.id, { lastActive: new Date().toISOString() });
  
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, targetExam: user.targetExam, primaryPlatform: user.primaryPlatform, streakCount: user.streakCount } });
});

// Profile / Current User Stats
app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
  const userId = req.user.key;
  const user = await db.findUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  // Calculate dynamic statistics
  const attempts = await db.getMocks(userId);
  const totalMocks = attempts.length;
  
  let avgScore = 0;
  let highestScore = 0;
  let avgPercentile = 0;
  let avgAccuracy = 0;
  let totalStudyHours = 0;

  let strongSubject = 'Mathematics';
  let weakSubject = 'GeneralKnowledge';

  if (totalMocks > 0) {
    let scoreSum = 0;
    let percentileSum = 0;
    let accuracySum = 0;
    
    // Subject scores
    type SubjectKeys = 'Mathematics' | 'Reasoning' | 'English' | 'GeneralKnowledge';
    const subAccuracySum: Record<SubjectKeys, number> = { Mathematics: 0, Reasoning: 0, English: 0, GeneralKnowledge: 0 };

    attempts.forEach(attempt => {
      scoreSum += attempt.score;
      highestScore = Math.max(highestScore, attempt.score);
      percentileSum += attempt.percentile;
      accuracySum += attempt.accuracy;
      totalStudyHours += attempt.studyHours;

      // Section averages
      const keys = ['Mathematics', 'Reasoning', 'English', 'GeneralKnowledge'] as SubjectKeys[];
      keys.forEach(key => {
        subAccuracySum[key] += attempt.sectionData[key]?.accuracy || 0;
      });
    });

    avgScore = parseFloat((scoreSum / totalMocks).toFixed(1));
    avgPercentile = parseFloat((percentileSum / totalMocks).toFixed(1));
    avgAccuracy = parseFloat((accuracySum / totalMocks).toFixed(1));

    // Determine strongest & weakest subjects based on average section accuracy
    const avgSubAcc = Object.entries(subAccuracySum).map(([subj, sum]) => ({
      subject: subj as SubjectKeys,
      avgAcc: sum / totalMocks
    }));

    avgSubAcc.sort((a,b) => b.avgAcc - a.avgAcc);
    strongSubject = avgSubAcc[0].subject;
    weakSubject = avgSubAcc[avgSubAcc.length - 1].subject;
  }

  // Calculate achievements
  const achievements = [
    { id: 'ac1', title: 'First Blood', description: 'Log your first completed mock test.', icon: '🎯', unlocked: totalMocks >= 1 },
    { id: 'ac2', title: 'Precision Shooter', description: 'Achieve an accuracy rate above 85% in any mock.', icon: '⚡', unlocked: attempts.some(a => a.accuracy >= 85) },
    { id: 'ac3', title: 'Elite Centurion', description: 'Cross a mock percentile above 95% on F64 Academy.', icon: '👑', unlocked: attempts.some(a => a.percentile >= 95) },
    { id: 'ac4', title: 'Unstoppable Streak', description: 'Hold a dynamic streak of 5 days or more.', icon: '🔥', unlocked: user.streakCount >= 5 },
    { id: 'ac5', title: 'Workhorse', description: 'Devote a total of 20+ study hours to mock analytics.', icon: '✏️', unlocked: totalStudyHours >= 20 },
  ];

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      targetExam: user.targetExam,
      primaryPlatform: user.primaryPlatform,
      dailyStudyGoal: user.dailyStudyGoal || 5,
      streakCount: user.streakCount || 1,
      currentRank: user.currentRank || 8,
    },
    stats: {
      totalMocks,
      avgScore,
      highestScore,
      avgPercentile,
      currentRank: user.currentRank || 8,
      avgAccuracy,
      totalStudyHours,
      strongestSubject: strongSubject,
      weakestSubject: weakSubject,
      dailyStreak: user.streakCount || 1,
      achievements
    }
  });
});

// Update Profile
app.put('/api/auth/profile', authenticateToken, async (req: any, res) => {
  const userId = req.user.key;
  const { name, targetExam, primaryPlatform, dailyStudyGoal, avatar } = req.body;
  
  const updated = await db.updateUser(userId, {
    ...(name && { name }),
    ...(targetExam && { targetExam }),
    ...(primaryPlatform && { primaryPlatform }),
    ...(dailyStudyGoal !== undefined && { dailyStudyGoal: Number(dailyStudyGoal) }),
    ...(avatar && { avatar })
  });

  if (!updated) {
    return res.status(404).json({ error: 'User key not found.' });
  }

  broadcastUpdate('profileUpdated', { userId, name: updated.name });
  res.json({ user: updated });
});

// Update Password with 7-day restriction checks
app.put('/api/auth/password', authenticateToken, async (req: any, res) => {
  const userId = req.user.key;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Please provide both current and new passwords.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  const user = await db.findUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  // Check 7-day rotation limitation
  if (user.passwordLastUpdated) {
    const lastUpdated = new Date(user.passwordLastUpdated).getTime();
    const now = Date.now();
    const msDiff = now - lastUpdated;
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

    if (msDiff < sevenDaysInMs) {
      const remainingMs = sevenDaysInMs - msDiff;
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      
      const timeString = days > 0 
        ? `${days} day(s) and ${remainingHours} hour(s)` 
        : `${hours} hour(s)`;

      return res.status(400).json({ 
        error: `Security rotation limit: You can only update your password once every 7 days. Please try again in ${timeString}.` 
      });
    }
  }

  // Compare existing password hash
  if (!bcrypt.compareSync(currentPassword, user.passwordHash)) {
    return res.status(400).json({ error: 'Incorrect current password.' });
  }

  // Compute new hashes and save state
  const newHash = bcrypt.hashSync(newPassword, 10);
  await db.updateUser(userId, {
    passwordHash: newHash,
    passwordLastUpdated: new Date().toISOString()
  } as any);

  res.json({ success: true, message: 'Password successfully updated!' });
});

// ================= MOCKS ATTEMPTS ENDPOINTS =================

// Get lists of mocks
app.get('/api/mocks', authenticateToken, async (req: any, res) => {
  const userId = req.user.key;
  const attempts = await db.getMocks(userId);
  res.json(attempts);
});

// Add attempts
app.post('/api/mocks', authenticateToken, async (req: any, res) => {
  const userId = req.user.key;
  const {
    date,
    examType,
    platform,
    mockType,
    mockNumber,
    score,
    overallRank,
    percentile,
    accuracy,
    studyHours,
    sectionData
  } = req.body;

  if (!date || !examType || !platform || !mockType || !mockNumber || score === undefined) {
    return res.status(400).json({ error: 'Minimum mock requirements not complete.' });
  }

  // Calculate section indicators and accuracies if missing or update values
  const formattedSections: any = {};
  const sections = ['Mathematics', 'Reasoning', 'English', 'GeneralKnowledge'] as const;
  
  let totalCorrect = 0;
  let totalWrong = 0;
  let totalUnattempted = 0;

  sections.forEach(sec => {
    const data = sectionData[sec] || {
      totalMarks: 0,
      correctQuestions: 0,
      wrongQuestions: 0,
      unattemptedQuestions: 0,
      timeTaken: 15,
      weakTopics: [],
      confidenceRating: 3,
    };

    const qSum = data.correctQuestions + data.wrongQuestions + data.unattemptedQuestions;
    const calcAccuracy = qSum > 0 ? parseFloat(((data.correctQuestions / (data.correctQuestions + data.wrongQuestions)) * 100).toFixed(1)) : 0;
    
    // Performance Indicator
    let indicator: 'Strong' | 'Medium' | 'Weak' = 'Medium';
    if (calcAccuracy >= 85 && data.confidenceRating >= 4) {
      indicator = 'Strong';
    } else if (calcAccuracy < 65 || data.confidenceRating <= 2) {
      indicator = 'Weak';
    }

    formattedSections[sec] = {
      ...data,
      accuracy: calcAccuracy || 0,
      performanceIndicator: indicator,
    };

    totalCorrect += data.correctQuestions;
    totalWrong += data.wrongQuestions;
    totalUnattempted += data.unattemptedQuestions;
  });

  // Flat weak topics derived from section data
  const flatWeakTopicsSet = new Set<string>();
  sections.forEach(sec => {
    const wt = formattedSections[sec].weakTopics || [];
    wt.forEach((topic: string) => {
      if (topic && topic.trim() !== '') flatWeakTopicsSet.add(topic.trim());
    });
  });

  const calculatedAccuracy = (totalCorrect + totalWrong) > 0 ? parseFloat(((totalCorrect / (totalCorrect + totalWrong)) * 100).toFixed(1)) : (accuracy || 80);

  const attemptToSave = {
    date,
    examType,
    platform,
    mockType,
    mockNumber,
    score: Number(score),
    overallRank: Number(overallRank) || 1200,
    percentile: Number(percentile) || 90.0,
    accuracy: Number(calculatedAccuracy),
    studyHours: Number(studyHours) || 2.0,
    sectionData: formattedSections,
    weakTopics: Array.from(flatWeakTopicsSet),
  };

  const added = await db.addMockAttempt(userId, attemptToSave);

  const user = await db.findUserById(userId);
  broadcastUpdate('newMockLogged', {
    userName: user ? user.name : 'A competitor',
    platform: added.platform,
    exam: added.examType,
    score: added.score,
  });

  res.json(added);
});

// Delete mock
app.delete('/api/mocks/:id', authenticateToken, async (req: any, res) => {
  const userId = req.user.key;
  const mockId = req.params.id;

  const deleted = await db.deleteMockAttempt(userId, mockId);
  if (!deleted) {
    return res.status(404).json({ error: 'Mock attempt not found or unauthorized.' });
  }

  res.json({ success: true, message: 'Mock attempt successfully removed.' });
});

// ================= ANALYTICS ENDPOINTS =================

// Realtime competitive Leaderboard
app.get('/api/leaderboard', authenticateToken, async (req: any, res) => {
  const userId = req.user.key;
  const lb = (await db.getLeaderboard()).map(item => ({
    ...item,
    isCurrentUser: item.userId === userId
  }));
  res.json(lb);
});

// Weak Topic statistics
app.get('/api/weak-topics', authenticateToken, async (req: any, res) => {
  const userId = req.user.key;
  const attempts = await db.getMocks(userId);

  type SubjectKeys = 'Mathematics' | 'Reasoning' | 'English' | 'GeneralKnowledge';

  interface TopicStatAccumulator {
    topic: string;
    subject: SubjectKeys;
    mistakesCount: number;
    occurrences: number;
    accuracies: number[];
  }

  const topicMap: Record<string, TopicStatAccumulator> = {};

  attempts.forEach(attempt => {
    const keys = ['Mathematics', 'Reasoning', 'English', 'GeneralKnowledge'] as SubjectKeys[];
    keys.forEach(subj => {
      const metrics = attempt.sectionData[subj];
      if (metrics && metrics.weakTopics) {
        metrics.weakTopics.forEach((topic: string) => {
          if (!topic || topic.trim() === '') return;
          const cleanTopic = topic.trim();
          const mapKey = `${subj}_${cleanTopic}`;

          if (!topicMap[mapKey]) {
            topicMap[mapKey] = {
              topic: cleanTopic,
              subject: subj,
              mistakesCount: metrics.wrongQuestions,
              occurrences: 1,
              accuracies: [metrics.accuracy],
            };
          } else {
            topicMap[mapKey].mistakesCount += metrics.wrongQuestions;
            topicMap[mapKey].occurrences += 1;
            topicMap[mapKey].accuracies.push(metrics.accuracy);
          }
        });
      }
    });
  });

  const finalStats = Object.values(topicMap).map(item => {
    const avgAccuracy = item.accuracies.reduce((a, b) => a + b, 0) / item.accuracies.length;
    
    let classification: 'Strong' | 'Medium' | 'Weak' = 'Medium';
    if (avgAccuracy < 60 || item.occurrences >= 3) {
      classification = 'Weak';
    } else if (avgAccuracy > 80) {
      classification = 'Strong';
    }

    return {
      topic: item.topic,
      subject: item.subject,
      mistakesCount: item.mistakesCount,
      frequency: item.occurrences,
      accuracy: Math.round(avgAccuracy),
      classification,
      improvementTrend: avgAccuracy > 75 ? 'improving' : 'stable',
    };
  });

  res.json(finalStats);
});

// AI Insights - dynamic via Gemini-3.5-flash
app.post('/api/insights/ai', authenticateToken, async (req: any, res) => {
  const userId = req.user.key;
  const user = await db.findUserById(userId);
  const attempts = await db.getMocks(userId);

  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  // Pre-aggregate user performance profiles to construct high-quality prompts
  const count = attempts.length;
  if (count === 0) {
    return res.json({
      insights: [
        'No mock attempts logged yet. Submit your first mock entry to activate our real-time AI-Powered Insights engine!',
        'Start with a full-length mock tracker to inspect active accuracy margins.'
      ],
      recommendations: [
        { title: 'Baseline Evaluation', suggestion: 'Log a PYQ or full mock to help us determine subject focus priorities.' }
      ]
    });
  }

  const scores = attempts.map(a => a.score);
  const avgScore = (scores.reduce((a, b) => a + b, 0) / count).toFixed(1);
  const maxScore = Math.max(...scores);
  const platformStats = attempts.reduce((acc: any, curr) => {
    acc[curr.platform] = (acc[curr.platform] || 0) + 1;
    return acc;
  }, {});
  const favPlatform = Object.entries(platformStats).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'F64 Academy';

  // Gather weak topics
  const allWeakTopics = attempts.reduce((acc: string[], curr) => [...acc, ...curr.weakTopics], []);
  const topWeakTopics = Array.from(new Set(allWeakTopics)).slice(0, 5);

  // Subject Accuracies
  const subStatistics = {
    Mathematics: attempts.reduce((sum, a) => sum + (a.sectionData.Mathematics?.accuracy || 0), 0) / count,
    Reasoning: attempts.reduce((sum, a) => sum + (a.sectionData.Reasoning?.accuracy || 0), 0) / count,
    English: attempts.reduce((sum, a) => sum + (a.sectionData.English?.accuracy || 0), 0) / count,
    GeneralKnowledge: attempts.reduce((sum, a) => sum + (a.sectionData.GeneralKnowledge?.accuracy || 0), 0) / count,
  };

  if (ai) {
    // Elegant Server-Side Gemini Request
    try {
      const prompt = `
        You are an elite, production-grade AI Coach at F64 Academy, specializes in SSC CGL and government exam analytics.
        Analyze this student's actual performance metrics:
        - Target Exam: ${user.targetExam}
        - Total Mocks Logged: ${count}
        - average Score: ${avgScore} (Best Score: ${maxScore})
        - Favorite Platform: ${favPlatform}
        - Subject-Wise Average Accuracies:
          * Mathematics: ${subStatistics.Mathematics.toFixed(1)}%
          * Reasoning: ${subStatistics.Reasoning.toFixed(1)}%
          * English: ${subStatistics.English.toFixed(1)}%
          * General Knowledge: ${subStatistics.GeneralKnowledge.toFixed(1)}%
        - Current Weak Topics logged by user: ${topWeakTopics.join(', ')}

        Generate exactly 4-5 brilliant, highly specific coaching insights and 3 actionable improvement suggestions.
        Ensure insights reference the specific subject percentages and platforms (e.g. Testbook, Oliveboard).
        Provide the response in raw JSON format matching this schema:
        {
          "insights": [
             "Insight line 1 reflecting factual performance ratios...",
             "Insight line 2..."
          ],
          "recommendations": [
             { "title": "Highly Actionable Priority", "suggestion": "Bulletproof tactical plan outlining what to do next in specific subjects..." }
          ]
        }
        Return ONLY valid JSON. Delete all markdown blocks like \`\`\`json.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const responseText = response.text || '';
      try {
        const cleanedStr = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
        const parsedData = JSON.parse(cleanedStr);
        return res.json(parsedData);
      } catch (parseError) {
        console.error('JSON parsing failure from Gemini text response:', responseText, parseError);
        // Fallback below
      }
    } catch (apiError) {
      console.error('Gemini API call failure:', apiError);
      // Fallback
    }
  }

  // Factual analytical fallback engine
  const generatedInsights: string[] = [];
  const recommendations: { title: string; suggestion: string }[] = [];

  // Insight 1: Reasoning Accuracy
  if (subStatistics.Reasoning > 85) {
    generatedInsights.push(`Your Reasoning accuracy is stellar (${subStatistics.Reasoning.toFixed(1)}%). You consistently convert mock series reasoning with strong logical reflexes.`);
  } else {
    generatedInsights.push(`Reasoning average stands at ${subStatistics.Reasoning.toFixed(1)}%. Focus on non-verbal syllogisms and coding sequences to unlock low-hanging raw points.`);
  }

  // Insight 2: Quantitative Aptitude
  if (subStatistics.Mathematics < 75) {
    generatedInsights.push(`Algebra & Geometry formulas are bottlenecking your speed. Quantitative accuracy of ${subStatistics.Mathematics.toFixed(1)}% requires target sectional drills.`);
  } else {
    generatedInsights.push(`Continuous mathematical consistency maintained. Average accuracy exceeds benchmark thresholds (${subStatistics.Mathematics.toFixed(1)}%).`);
  }

  // Insight 3: platform insights
  generatedInsights.push(`Favored assessment routine runs through ${favPlatform}. Benchmark scoring patterns indicate maximum speed efficiency during full-length attempts.`);

  // Insight 4: General Knowledge
  if (subStatistics.GeneralKnowledge < 60) {
    generatedInsights.push(`GK is currently pulling down your averages (${subStatistics.GeneralKnowledge.toFixed(1)}%). Focus intensely on Current Affairs and Polity articles.`);
  } else {
    generatedInsights.push(`Strong General Knowledge score core of ${subStatistics.GeneralKnowledge.toFixed(1)}% safeguards overall rank escalations.`);
  }

  // Recommendations
  recommendations.push({
    title: 'Time Allocation Rebalancing',
    suggestion: `Deduct 5 minutes from English comprehension runs and reinvest into Algebra and Geometry solving times to correct mathematical multipliers.`
  });

  if (topWeakTopics.length > 0) {
    recommendations.push({
      title: 'Weak Topic Targeted Blitzing',
      suggestion: `Schedule 45-minute daily focus sprints dedicated precisely to static PYQ exercises in ${topWeakTopics.slice(0, 2).join(' and ')}.`
    });
  }

  recommendations.push({
    title: 'Platform Diversification Run',
    suggestion: `Your primary playground is ${favPlatform}. Schedule at least 1 mock on Oliveboard or F64 Academy this week to test adjustment under differing exam parameters.`
  });

  res.json({
    insights: generatedInsights,
    recommendations
  });
});

// ================= VITE ASYNC SERVER HANDLING =================

async function startServer() {
  // Initialize Database (MongoDB/Fallback)
  await db.init();

  // Vite dev mode integration
  if (process.env.NODE_ENV !== "production") {
    console.log('Mounting Vite middleware for development...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Serving production static distribution assets...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server fully booted on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

startServer();
