import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  uploadDir: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads'),
  audioUploadDir: path.resolve(__dirname, '../../uploads/audio'),
  dataDir: path.resolve(__dirname, '../../data'),
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  deepgramApiKey: process.env.DEEPGRAM_API_KEY || '',
  redisUrl: process.env.REDIS_URL || '',
  storageType: process.env.STORAGE_TYPE || 'local',
  s3Bucket: process.env.S3_BUCKET || '',
};
