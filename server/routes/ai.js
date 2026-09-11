import express from 'express';
import { store } from '../db/store.js';
import { analyzeReferenceVideo } from '../services/referenceAnalyzer.js';
import { planTimeline } from '../services/timelinePlanner.js';
import { parseIntentAndMutateTimeline } from '../services/intentParser.js';

const router = express.Router();

const CREDIT_COSTS = {
  ANALYZE_REFERENCE: 10,
  AUTO_EDIT: 20,
  CHAT_EDIT: 5,
  EXPORT_RENDER: 15
};

// GET /api/ai/cost-estimate
router.get('/cost-estimate', (req, res) => {
  res.json({ costs: CREDIT_COSTS });
});

// POST /api/ai/analyze-reference
router.post('/analyze-reference', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr_premium';
    const { fileMeta = {}, clientAnalysis = {} } = req.body;

    // Server-side credit deduction
    store.deductCredits(userId, CREDIT_COSTS.ANALYZE_REFERENCE, 'Reference Video Style Analysis');

    // Run real analysis pipeline
    const styleProfile = analyzeReferenceVideo(fileMeta, clientAnalysis);

    const user = store.getUser(userId);

    res.json({
      success: true,
      styleProfile,
      remainingCredits: user.credits
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/ai/auto-edit
router.post('/auto-edit', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr_premium';
    const {
      userClips = [],
      referenceStyle = null,
      institutionProfile = null,
      aspectRatio = '9:16',
      targetDuration = 0,
      userInstructions = '',
      selectedBackground = null,
      voiceAudio = null
    } = req.body;

    // Server-side credit deduction
    store.deductCredits(userId, CREDIT_COSTS.AUTO_EDIT, 'AI Auto Edit Timeline Generation');

    // Merge saved institution profile if not provided
    const instProfile = institutionProfile || store.getInstitutionProfile(userId);

    // Generate structured timeline
    const timeline = planTimeline({
      userClips,
      referenceStyle,
      institutionProfile: instProfile,
      aspectRatio,
      targetDuration,
      userInstructions,
      selectedBackground,
      voiceAudio
    });

    const user = store.getUser(userId);

    res.json({
      success: true,
      timeline,
      remainingCredits: user.credits
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/ai/chat-edit
router.post('/chat-edit', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr_premium';
    const {
      message,
      currentTimeline,
      institutionProfile = null,
      referenceStyle = null,
      selectedElementId = null,
      history = []
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Instruction message is required.' });
    }

    // Server-side credit deduction
    store.deductCredits(userId, CREDIT_COSTS.CHAT_EDIT, 'Conversational Timeline Revision');

    const instProfile = institutionProfile || store.getInstitutionProfile(userId);

    // Intent parser execution
    const result = parseIntentAndMutateTimeline({
      message,
      currentTimeline,
      institutionProfile: instProfile,
      referenceStyle,
      selectedElementId,
      history
    });

    const user = store.getUser(userId);

    res.json({
      success: true,
      actionType: result.actionType,
      mutatedTimeline: result.mutatedTimeline,
      explanation: result.explanation,
      language: result.language,
      remainingCredits: user.credits
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
