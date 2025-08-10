import express from 'express';
import { body, validationResult } from 'express-validator';
import { TTSController } from '../controllers/ttsController.js';
import { authMiddleware } from '../middleware/auth.js';
import { rateLimit } from 'express-rate-limit';
import { logger } from '../utils/logger.js';

const router = express.Router();
const ttsController = new TTSController();

// Rate limiting for TTS requests
const ttsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 TTS requests per minute
  message: 'Too many TTS requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const validateTTSRequest = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Text must be between 1 and 5000 characters'),
  body('voice')
    .optional()
    .isString()
    .withMessage('Voice must be a string'),
  body('speed')
    .optional()
    .isFloat({ min: 0.5, max: 2.0 })
    .withMessage('Speed must be between 0.5 and 2.0'),
  body('pitch')
    .optional()
    .isFloat({ min: -20, max: 20 })
    .withMessage('Pitch must be between -20 and 20'),
  body('volume')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Volume must be between 0 and 1'),
  body('format')
    .optional()
    .isIn(['mp3', 'wav', 'ogg', 'm4a'])
    .withMessage('Format must be mp3, wav, ogg, or m4a'),
  body('provider')
    .optional()
    .isIn(['openai', 'google', 'aws', 'azure', 'elevenlabs'])
    .withMessage('Provider must be openai, google, aws, azure, or elevenlabs')
];

// Get available voices
router.get('/voices', async (req, res) => {
  try {
    const { provider = 'openai' } = req.query;
    const voices = await ttsController.getAvailableVoices(provider);
    res.json({
      success: true,
      data: voices,
      provider
    });
  } catch (error) {
    logger.error('Error fetching voices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available voices'
    });
  }
});

// Get supported languages
router.get('/languages', async (req, res) => {
  try {
    const languages = await ttsController.getSupportedLanguages();
    res.json({
      success: true,
      data: languages
    });
  } catch (error) {
    logger.error('Error fetching languages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch supported languages'
    });
  }
});

// Convert text to speech
router.post('/convert', 
  ttsLimiter,
  validateTTSRequest,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const {
        text,
        voice = 'alloy',
        speed = 1.0,
        pitch = 0,
        volume = 1.0,
        format = 'mp3',
        provider = 'openai',
        language = 'en'
      } = req.body;

      const result = await ttsController.convertTextToSpeech({
        text,
        voice,
        speed,
        pitch,
        volume,
        format,
        provider,
        language,
        userId: req.user?.id
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('TTS conversion error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to convert text to speech'
      });
    }
  }
);

// Stream TTS (for real-time applications)
router.post('/stream',
  ttsLimiter,
  validateTTSRequest,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const {
        text,
        voice = 'alloy',
        speed = 1.0,
        pitch = 0,
        volume = 1.0,
        format = 'mp3',
        provider = 'openai',
        language = 'en'
      } = req.body;

      // Set headers for streaming
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      await ttsController.streamTextToSpeech({
        text,
        voice,
        speed,
        pitch,
        volume,
        format,
        provider,
        language,
        userId: req.user?.id
      }, res);

    } catch (error) {
      logger.error('TTS streaming error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to stream text to speech'
      });
    }
  }
);

// Batch TTS conversion
router.post('/batch',
  authMiddleware,
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // limit to 5 batch requests per 5 minutes
  }),
  async (req, res) => {
    try {
      const { texts, voice, speed, pitch, volume, format, provider } = req.body;
      
      if (!Array.isArray(texts) || texts.length === 0 || texts.length > 10) {
        return res.status(400).json({
          success: false,
          error: 'Texts must be an array with 1-10 items'
        });
      }

      const results = await ttsController.batchConvert({
        texts,
        voice,
        speed,
        pitch,
        volume,
        format,
        provider,
        userId: req.user.id
      });

      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      logger.error('Batch TTS error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process batch TTS'
      });
    }
  }
);

// Get TTS history (for authenticated users)
router.get('/history',
  authMiddleware,
  async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const history = await ttsController.getUserHistory(req.user.id, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      logger.error('Error fetching TTS history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch TTS history'
      });
    }
  }
);

// Delete TTS history item
router.delete('/history/:id',
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      await ttsController.deleteHistoryItem(req.user.id, id);

      res.json({
        success: true,
        message: 'History item deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting TTS history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete history item'
      });
    }
  }
);

// Get TTS usage statistics
router.get('/stats',
  authMiddleware,
  async (req, res) => {
    try {
      const stats = await ttsController.getUserStats(req.user.id);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error fetching TTS stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch usage statistics'
      });
    }
  }
);

export default router;