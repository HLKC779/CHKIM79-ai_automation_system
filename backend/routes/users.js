import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/init.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get user settings
router.get('/settings', async (req, res) => {
  try {
    const db = getDatabase();
    const settings = await db('user_settings').where('user_id', req.user.id).first();
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        error: 'Settings not found'
      });
    }

    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    logger.error('Error fetching user settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settings'
    });
  }
});

// Update user settings
router.put('/settings', [
  body('default_voice')
    .optional()
    .isString()
    .withMessage('Default voice must be a string'),
  body('default_speed')
    .optional()
    .isFloat({ min: 0.5, max: 2.0 })
    .withMessage('Default speed must be between 0.5 and 2.0'),
  body('default_pitch')
    .optional()
    .isFloat({ min: -20, max: 20 })
    .withMessage('Default pitch must be between -20 and 20'),
  body('default_volume')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('Default volume must be between 0 and 1'),
  body('default_format')
    .optional()
    .isIn(['mp3', 'wav', 'ogg', 'm4a'])
    .withMessage('Default format must be mp3, wav, ogg, or m4a'),
  body('default_provider')
    .optional()
    .isIn(['openai', 'google', 'aws', 'azure', 'elevenlabs'])
    .withMessage('Default provider must be openai, google, aws, azure, or elevenlabs'),
  body('default_language')
    .optional()
    .isString()
    .withMessage('Default language must be a string'),
  body('auto_save_history')
    .optional()
    .isBoolean()
    .withMessage('Auto save history must be a boolean'),
  body('email_notifications')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const db = getDatabase();
    const updateData = { updated_at: new Date() };

    // Add only the fields that are provided
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    });

    await db('user_settings')
      .where('user_id', req.user.id)
      .update(updateData);

    const updatedSettings = await db('user_settings').where('user_id', req.user.id).first();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings
    });

  } catch (error) {
    logger.error('Error updating user settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings'
    });
  }
});

// Get user usage statistics
router.get('/usage', async (req, res) => {
  try {
    const db = getDatabase();
    
    // Get current month usage
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const monthlyStats = await db('usage_stats')
      .where('user_id', req.user.id)
      .whereRaw("strftime('%Y-%m', date) = ?", [currentMonth])
      .first();

    // Get total usage
    const totalStats = await db('tts_history')
      .where('user_id', req.user.id)
      .select(
        db.raw('COUNT(*) as total_conversions'),
        db.raw('SUM(LENGTH(text)) as total_characters'),
        db.raw('SUM(file_size) as total_file_size')
      )
      .first();

    // Get user limits
    const user = await db('users').where('id', req.user.id).first();

    res.json({
      success: true,
      data: {
        currentMonth: {
          conversions: monthlyStats?.conversions || 0,
          characters: monthlyStats?.characters || 0,
          fileSize: monthlyStats?.file_size || 0
        },
        total: {
          conversions: totalStats.total_conversions || 0,
          characters: totalStats.total_characters || 0,
          fileSize: totalStats.total_file_size || 0
        },
        limits: {
          monthlyLimit: user.monthly_limit,
          isPremium: user.is_premium
        }
      }
    });

  } catch (error) {
    logger.error('Error fetching user usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage statistics'
    });
  }
});

// Get user API keys
router.get('/api-keys', async (req, res) => {
  try {
    const db = getDatabase();
    const apiKeys = await db('api_keys')
      .where('user_id', req.user.id)
      .select('id', 'name', 'is_active', 'last_used', 'created_at')
      .orderBy('created_at', 'desc');

    res.json({
      success: true,
      data: apiKeys
    });

  } catch (error) {
    logger.error('Error fetching API keys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch API keys'
    });
  }
});

// Create new API key
router.post('/api-keys', [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('API key name must be between 1 and 50 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name } = req.body;
    const db = getDatabase();

    // Generate API key
    const crypto = await import('crypto');
    const apiKey = `tts_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Save API key
    const [keyId] = await db('api_keys').insert({
      user_id: req.user.id,
      key_hash: keyHash,
      name,
      created_at: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'API key created successfully',
      data: {
        id: keyId,
        name,
        apiKey, // Only show this once
        created_at: new Date()
      }
    });

  } catch (error) {
    logger.error('Error creating API key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create API key'
    });
  }
});

// Delete API key
router.delete('/api-keys/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const deleted = await db('api_keys')
      .where({ user_id: req.user.id, id })
      .del();

    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        error: 'API key not found'
      });
    }

    res.json({
      success: true,
      message: 'API key deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting API key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete API key'
    });
  }
});

// Toggle API key status
router.patch('/api-keys/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const apiKey = await db('api_keys')
      .where({ user_id: req.user.id, id })
      .first();

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        error: 'API key not found'
      });
    }

    await db('api_keys')
      .where({ user_id: req.user.id, id })
      .update({ is_active: !apiKey.is_active });

    res.json({
      success: true,
      message: `API key ${apiKey.is_active ? 'deactivated' : 'activated'} successfully`
    });

  } catch (error) {
    logger.error('Error toggling API key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle API key status'
    });
  }
});

export default router;