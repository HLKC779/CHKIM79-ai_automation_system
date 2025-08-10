import OpenAI from 'openai';
import { TextToSpeechClient } from '@google-cloud/texttospeech';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';
import { getRedisClient } from '../database/redis.js';
import { getDatabase } from '../database/init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class TTSController {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.googleTTS = new TextToSpeechClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
    
    this.polly = new AWS.Polly({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });
    
    this.voices = {
      openai: [
        { id: 'alloy', name: 'Alloy', gender: 'neutral', language: 'en' },
        { id: 'echo', name: 'Echo', gender: 'male', language: 'en' },
        { id: 'fable', name: 'Fable', gender: 'male', language: 'en' },
        { id: 'onyx', name: 'Onyx', gender: 'male', language: 'en' },
        { id: 'nova', name: 'Nova', gender: 'female', language: 'en' },
        { id: 'shimmer', name: 'Shimmer', gender: 'female', language: 'en' }
      ],
      google: [
        { id: 'en-US-Standard-A', name: 'US English Female', gender: 'female', language: 'en-US' },
        { id: 'en-US-Standard-B', name: 'US English Male', gender: 'male', language: 'en-US' },
        { id: 'en-US-Standard-C', name: 'US English Female 2', gender: 'female', language: 'en-US' },
        { id: 'en-US-Standard-D', name: 'US English Male 2', gender: 'male', language: 'en-US' },
        { id: 'en-GB-Standard-A', name: 'British English Female', gender: 'female', language: 'en-GB' },
        { id: 'en-GB-Standard-B', name: 'British English Male', gender: 'male', language: 'en-GB' }
      ],
      aws: [
        { id: 'Joanna', name: 'Joanna (Female)', gender: 'female', language: 'en-US' },
        { id: 'Matthew', name: 'Matthew (Male)', gender: 'male', language: 'en-US' },
        { id: 'Ivy', name: 'Ivy (Female Child)', gender: 'female', language: 'en-US' },
        { id: 'Justin', name: 'Justin (Male Child)', gender: 'male', language: 'en-US' },
        { id: 'Emma', name: 'Emma (Female)', gender: 'female', language: 'en-GB' },
        { id: 'Brian', name: 'Brian (Male)', gender: 'male', language: 'en-GB' }
      ]
    };
    
    this.languages = [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' },
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { code: 'de', name: 'German', nativeName: 'Deutsch' },
      { code: 'it', name: 'Italian', nativeName: 'Italiano' },
      { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語' },
      { code: 'ko', name: 'Korean', nativeName: '한국어' },
      { code: 'zh', name: 'Chinese', nativeName: '中文' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' }
    ];
  }

  async getAvailableVoices(provider = 'openai') {
    try {
      if (provider === 'openai') {
        return this.voices.openai;
      } else if (provider === 'google') {
        return this.voices.google;
      } else if (provider === 'aws') {
        return this.voices.aws;
      } else {
        // For other providers, return a default set
        return this.voices.openai;
      }
    } catch (error) {
      logger.error('Error getting available voices:', error);
      throw new Error('Failed to fetch available voices');
    }
  }

  async getSupportedLanguages() {
    return this.languages;
  }

  async convertTextToSpeech(options) {
    const {
      text,
      voice = 'alloy',
      speed = 1.0,
      pitch = 0,
      volume = 1.0,
      format = 'mp3',
      provider = 'openai',
      language = 'en',
      userId = null
    } = options;

    try {
      let audioBuffer;
      let audioUrl;

      switch (provider) {
        case 'openai':
          audioBuffer = await this.convertWithOpenAI(text, voice, speed);
          break;
        case 'google':
          audioBuffer = await this.convertWithGoogle(text, voice, speed, pitch);
          break;
        case 'aws':
          audioBuffer = await this.convertWithAWS(text, voice, speed, pitch);
          break;
        case 'azure':
          audioBuffer = await this.convertWithAzure(text, voice, speed, pitch);
          break;
        case 'elevenlabs':
          audioBuffer = await this.convertWithElevenLabs(text, voice, speed);
          break;
        default:
          audioBuffer = await this.convertWithOpenAI(text, voice, speed);
      }

      // Save audio file
      const fileName = `${uuidv4()}.${format}`;
      const uploadDir = join(__dirname, '../uploads/audio');
      await mkdir(uploadDir, { recursive: true });
      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, audioBuffer);

      // Generate public URL
      audioUrl = `/uploads/audio/${fileName}`;

      // Save to database if user is authenticated
      if (userId) {
        await this.saveToHistory({
          userId,
          text,
          voice,
          speed,
          pitch,
          volume,
          format,
          provider,
          language,
          audioUrl,
          fileSize: audioBuffer.length
        });
      }

      // Cache the result
      const redis = getRedisClient();
      const cacheKey = `tts:${Buffer.from(text + voice + speed + pitch + provider).toString('base64')}`;
      await redis.setex(cacheKey, 3600, JSON.stringify({ audioUrl, fileSize: audioBuffer.length }));

      return {
        audioUrl,
        fileSize: audioBuffer.length,
        duration: this.estimateDuration(text, speed),
        format,
        provider,
        voice,
        text: text.substring(0, 100) + (text.length > 100 ? '...' : '')
      };

    } catch (error) {
      logger.error('TTS conversion error:', error);
      throw new Error(`Failed to convert text to speech: ${error.message}`);
    }
  }

  async convertWithOpenAI(text, voice, speed) {
    try {
      const response = await this.openai.audio.speech.create({
        model: "tts-1",
        voice: voice,
        input: text,
        speed: speed
      });

      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      logger.error('OpenAI TTS error:', error);
      throw new Error('OpenAI TTS service error');
    }
  }

  async convertWithGoogle(text, voice, speed, pitch) {
    try {
      const request = {
        input: { text },
        voice: {
          languageCode: 'en-US',
          name: voice,
          ssmlGender: 'NEUTRAL'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: speed,
          pitch: pitch,
          volumeGainDb: 0
        }
      };

      const [response] = await this.googleTTS.synthesizeSpeech(request);
      return Buffer.from(response.audioContent, 'base64');
    } catch (error) {
      logger.error('Google TTS error:', error);
      throw new Error('Google TTS service error');
    }
  }

  async convertWithAWS(text, voice, speed, pitch) {
    try {
      const params = {
        Text: text,
        OutputFormat: 'mp3',
        VoiceId: voice,
        SampleRate: '22050',
        SpeechMarkTypes: [],
        TextType: 'text'
      };

      const result = await this.polly.synthesizeSpeech(params).promise();
      return Buffer.from(result.AudioStream);
    } catch (error) {
      logger.error('AWS Polly error:', error);
      throw new Error('AWS Polly service error');
    }
  }

  async convertWithAzure(text, voice, speed, pitch) {
    // Azure Cognitive Services implementation
    // This would require Azure SDK and configuration
    throw new Error('Azure TTS not yet implemented');
  }

  async convertWithElevenLabs(text, voice, speed) {
    // ElevenLabs implementation
    // This would require ElevenLabs API key and configuration
    throw new Error('ElevenLabs TTS not yet implemented');
  }

  async streamTextToSpeech(options, res) {
    const {
      text,
      voice = 'alloy',
      speed = 1.0,
      pitch = 0,
      volume = 1.0,
      format = 'mp3',
      provider = 'openai',
      language = 'en',
      userId = null
    } = options;

    try {
      const audioBuffer = await this.convertTextToSpeech({
        text,
        voice,
        speed,
        pitch,
        volume,
        format,
        provider,
        language,
        userId
      });

      // Stream the audio buffer
      res.write(audioBuffer.audioUrl);
      res.end();

    } catch (error) {
      logger.error('TTS streaming error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  async batchConvert(options) {
    const {
      texts,
      voice,
      speed,
      pitch,
      volume,
      format,
      provider,
      userId
    } = options;

    const results = [];
    
    for (const text of texts) {
      try {
        const result = await this.convertTextToSpeech({
          text,
          voice,
          speed,
          pitch,
          volume,
          format,
          provider,
          userId
        });
        results.push({ success: true, data: result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }

    return results;
  }

  async saveToHistory(data) {
    try {
      const db = getDatabase();
      await db('tts_history').insert({
        user_id: data.userId,
        text: data.text,
        voice: data.voice,
        speed: data.speed,
        pitch: data.pitch,
        volume: data.volume,
        format: data.format,
        provider: data.provider,
        language: data.language,
        audio_url: data.audioUrl,
        file_size: data.fileSize,
        created_at: new Date()
      });
    } catch (error) {
      logger.error('Error saving TTS history:', error);
    }
  }

  async getUserHistory(userId, options = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const offset = (page - 1) * limit;

      const db = getDatabase();
      const history = await db('tts_history')
        .where('user_id', userId)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);

      const total = await db('tts_history')
        .where('user_id', userId)
        .count('* as count')
        .first();

      return {
        history,
        pagination: {
          page,
          limit,
          total: total.count,
          pages: Math.ceil(total.count / limit)
        }
      };
    } catch (error) {
      logger.error('Error fetching user history:', error);
      throw new Error('Failed to fetch user history');
    }
  }

  async deleteHistoryItem(userId, itemId) {
    try {
      const db = getDatabase();
      await db('tts_history')
        .where({ user_id: userId, id: itemId })
        .del();
    } catch (error) {
      logger.error('Error deleting history item:', error);
      throw new Error('Failed to delete history item');
    }
  }

  async getUserStats(userId) {
    try {
      const db = getDatabase();
      
      const totalConversions = await db('tts_history')
        .where('user_id', userId)
        .count('* as count')
        .first();

      const totalCharacters = await db('tts_history')
        .where('user_id', userId)
        .sum(db.raw('LENGTH(text) as total'))
        .first();

      const totalFileSize = await db('tts_history')
        .where('user_id', userId)
        .sum('file_size as total')
        .first();

      const providerStats = await db('tts_history')
        .where('user_id', userId)
        .select('provider')
        .count('* as count')
        .groupBy('provider');

      return {
        totalConversions: totalConversions.count,
        totalCharacters: totalCharacters.total || 0,
        totalFileSize: totalFileSize.total || 0,
        providerStats
      };
    } catch (error) {
      logger.error('Error fetching user stats:', error);
      throw new Error('Failed to fetch user statistics');
    }
  }

  estimateDuration(text, speed) {
    // Rough estimation: average speaking rate is 150 words per minute
    const words = text.split(' ').length;
    const baseDuration = (words / 150) * 60; // in seconds
    return Math.round(baseDuration / speed);
  }
}