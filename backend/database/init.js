import knex from 'knex';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdir } from 'fs/promises';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = null;

export const initDatabase = async () => {
  try {
    // Create database directory if it doesn't exist
    const dbDir = join(__dirname, '../data');
    await mkdir(dbDir, { recursive: true });

    // Initialize Knex with SQLite
    db = knex({
      client: 'sqlite3',
      connection: {
        filename: join(dbDir, 'tts_ai.db')
      },
      useNullAsDefault: true,
      pool: {
        min: 2,
        max: 10
      }
    });

    // Create tables
    await createTables();
    
    logger.info('Database initialized successfully');
    return db;
  } catch (error) {
    logger.error('Database initialization error:', error);
    throw error;
  }
};

const createTables = async () => {
  // Users table
  await db.schema.createTableIfNotExists('users', (table) => {
    table.increments('id').primary();
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('name');
    table.string('avatar_url');
    table.boolean('is_premium').defaultTo(false);
    table.integer('monthly_usage').defaultTo(0);
    table.integer('monthly_limit').defaultTo(1000);
    table.timestamp('created_at').defaultTo(db.fn.now());
    table.timestamp('updated_at').defaultTo(db.fn.now());
  });

  // TTS History table
  await db.schema.createTableIfNotExists('tts_history', (table) => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.text('text').notNullable();
    table.string('voice').notNullable();
    table.float('speed').defaultTo(1.0);
    table.float('pitch').defaultTo(0);
    table.float('volume').defaultTo(1.0);
    table.string('format').defaultTo('mp3');
    table.string('provider').defaultTo('openai');
    table.string('language').defaultTo('en');
    table.string('audio_url').notNullable();
    table.integer('file_size');
    table.timestamp('created_at').defaultTo(db.fn.now());
  });

  // API Keys table
  await db.schema.createTableIfNotExists('api_keys', (table) => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('key_hash').unique().notNullable();
    table.string('name');
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_used');
    table.timestamp('created_at').defaultTo(db.fn.now());
  });

  // Usage Statistics table
  await db.schema.createTableIfNotExists('usage_stats', (table) => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.date('date').notNullable();
    table.integer('conversions').defaultTo(0);
    table.integer('characters').defaultTo(0);
    table.integer('file_size').defaultTo(0);
    table.timestamp('created_at').defaultTo(db.fn.now());
    table.unique(['user_id', 'date']);
  });

  // Settings table
  await db.schema.createTableIfNotExists('user_settings', (table) => {
    table.increments('id').primary();
    table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('default_voice').defaultTo('alloy');
    table.float('default_speed').defaultTo(1.0);
    table.float('default_pitch').defaultTo(0);
    table.float('default_volume').defaultTo(1.0);
    table.string('default_format').defaultTo('mp3');
    table.string('default_provider').defaultTo('openai');
    table.string('default_language').defaultTo('en');
    table.boolean('auto_save_history').defaultTo(true);
    table.boolean('email_notifications').defaultTo(false);
    table.timestamp('created_at').defaultTo(db.fn.now());
    table.timestamp('updated_at').defaultTo(db.fn.now());
  });

  logger.info('Database tables created successfully');
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

export const closeDatabase = async () => {
  if (db) {
    await db.destroy();
    logger.info('Database connection closed');
  }
};