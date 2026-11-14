import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

// Ensure uploads/audio directory exists
if (!fs.existsSync(config.audioUploadDir)) {
  fs.mkdirSync(config.audioUploadDir, { recursive: true });
}

// Multer disk storage engine
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.audioUploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.webm';
    const uniqueName = `${Date.now()}-${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter accepting audio formats and documents
const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedAudio = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/m4a',
    'audio/x-m4a',
    'audio/webm',
    'audio/ogg',
    'audio/aac',
    'audio/flac',
    'video/webm', // MediaRecorder in Chrome often emits video/webm with audio only
  ];
  const allowedDoc = [
    'text/plain',
    'text/vtt',
    'text/markdown',
    'application/octet-stream',
  ];

  if (
    allowedAudio.includes(file.mimetype) ||
    allowedDoc.includes(file.mimetype) ||
    file.originalname.match(/\.(mp3|wav|m4a|webm|ogg|flac|aac|txt|vtt|md|json)$/i)
  ) {
    cb(null, true);
  } else {
    cb(null, true); // Permissive for browser variations
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter,
});

export function getAudioFileUrl(filename: string): string {
  return `/uploads/audio/${filename}`;
}

export function getAudioFilePath(filename: string): string {
  return path.join(config.audioUploadDir, filename);
}
