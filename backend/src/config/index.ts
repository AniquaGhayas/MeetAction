import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or backend directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET || 'default-fallback-jwt-secret-do-not-use-in-prod',
  tokenEncryptionKey: process.env.TOKEN_ENCRYPTION_KEY || '',
  llmProvider: process.env.LLM_PROVIDER || 'openai',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  sttProvider: process.env.STT_PROVIDER || 'whisper',
  deepgramApiKey: process.env.DEEPGRAM_API_KEY || '',
  assemblyAiApiKey: process.env.ASSEMBLYAI_API_KEY || '',
  jira: {
    clientId: process.env.ATLASSIAN_CLIENT_ID || '',
    clientSecret: process.env.ATLASSIAN_CLIENT_SECRET || '',
    callbackUrl: process.env.ATLASSIAN_CALLBACK_URL || 'http://localhost:5000/api/integrations/jira/callback',
  },
  trello: {
    apiKey: process.env.TRELLO_API_KEY || '',
    apiSecret: process.env.TRELLO_API_SECRET || '',
    callbackUrl: process.env.TRELLO_CALLBACK_URL || 'http://localhost:5000/api/integrations/trello/callback',
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET || 'meetaction-uploads',
  },
};

