const express = require('express');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Middleware to verify JWT and role
function auth(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Create quiz (admin only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const { title, description, questions, timeLimitMinutes } = req.body;

    // Generate a random 6-digit code
    const quizCode = Math.floor(100000 + Math.random() * 900000).toString();

    const quiz = new Quiz({
      title,
      description,
      questions,
      quizCode,
      createdBy: req.user.id,
      timeLimitMinutes: timeLimitMinutes || undefined,
    });

    await quiz.save();
    res.status(201).json({ message: 'Quiz created', quiz });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('createdBy', 'name email');
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get results (admin can see all, users can see their own)
router.get('/results', auth, async (req, res) => {
  try {
    const { quizId, userId, name, email, minScore, maxScore } = req.query;
    const filter = {};
    
    // If user is not admin, they can only see their own results
    if (req.user.role !== 'admin') {
      filter.user = req.user.id;
    } else if (userId) {
      filter.user = userId;
    }
    
    if (quizId) filter.quiz = quizId;
    if (minScore) filter.score = { ...(filter.score || {}), $gte: Number(minScore) };
    if (maxScore) filter.score = { ...(filter.score || {}), $lte: Number(maxScore) };
    
    console.log('Fetching results with filter:', filter, { name, email });
    
    let results = await Result.find(filter)
      .populate({
        path: 'user',
        select: 'name email',
        model: 'User'
      })
      .populate({
        path: 'quiz',
        select: 'title questions quizCode',
        model: 'Quiz'
      })
      .sort({ submittedAt: -1 }); // Sort by most recent first

    // Apply name/email filters in-memory after population
    if (name) {
      const nameRegex = new RegExp(name, 'i');
      results = results.filter(r => nameRegex.test(r.user?.name || ''));
    }
    if (email) {
      const emailRegex = new RegExp(email, 'i');
      results = results.filter(r => emailRegex.test(r.user?.email || ''));
    }
    
    console.log(`Fetched ${results.length} results for user ${req.user.id}, role: ${req.user.role}`);
    console.log('Sample result:', results.length > 0 ? {
      id: results[0]._id,
      user: results[0].user,
      quiz: results[0].quiz,
      score: results[0].score
    } : 'No results');
    
    // Always return an array, even if empty
    res.json(results || []);
  } catch (err) {
    console.error('Error fetching results:', err);
    res.status(500).json({ message: err.message, results: [] });
  }
});

// Get leaderboard for a quiz (public, shows top results)
router.get('/leaderboard/:quizId', auth, async (req, res) => {
  try {
    const { quizId } = req.params;
    const results = await Result.find({ quiz: quizId })
      .populate('user', 'name email')
      .populate('quiz', 'title questions quizCode')
      .sort({ score: -1, submittedAt: 1 }) // Sort by score descending, then by submission time
      .limit(10); // Top 10
    
    console.log(`Fetched leaderboard for quiz ${quizId}: ${results.length} results`);
    res.json(results);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get single quiz by ID or code
router.get('/:id', async (req, res) => {
  try {
    let quiz;
    // Check if the ID is a valid ObjectId (24 hex characters)
    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      quiz = await Quiz.findById(req.params.id);
    } 
    // If not a valid ObjectId, try to find by quizCode
    if (!quiz) {
      quiz = await Quiz.findOne({ quizCode: req.params.id });
    }
    
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit answers and save result
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    
    const { answers } = req.body; // [{question, selected, correct}]
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Answers are required' });
    }
    
    // Calculate score
    let score = 0;
    answers.forEach(ans => {
      if (ans.selected === ans.correct) score++;
    });
    
    // Check if user already submitted this quiz (optional - remove if you want to allow retakes)
    const existingResult = await Result.findOne({ 
      user: req.user.id, 
      quiz: quiz._id 
    });
    
    // Create and save result
    const result = new Result({
      user: req.user.id,
      quiz: quiz._id,
      answers,
      score,
      submittedAt: new Date()
    });
    
    await result.save();
    console.log('Result saved successfully:', {
      userId: req.user.id,
      quizId: quiz._id,
      score: score,
      totalQuestions: quiz.questions.length
    });
    
    res.json({ 
      message: 'Result saved successfully', 
      score,
      totalQuestions: quiz.questions.length,
      resultId: result._id
    });
  } catch (err) {
    console.error('Error saving result:', err);
    res.status(500).json({ message: err.message || 'Failed to save result' });
  }
});

// Delete quiz (admin only)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    // Also delete all results for this quiz
    await Result.deleteMany({ quiz: quiz._id });
    res.json({ message: 'Quiz and related results deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update quiz (admin only)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const { title, description, questions, timeLimitMinutes } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (questions !== undefined) updates.questions = questions;
    if (timeLimitMinutes !== undefined) updates.timeLimitMinutes = timeLimitMinutes;

    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json({ message: 'Quiz updated successfully', quiz });
  } catch (err) {
    console.error('Error updating quiz:', err);
    res.status(500).json({ message: err.message || 'Failed to update quiz' });
  }
});

module.exports = router; 