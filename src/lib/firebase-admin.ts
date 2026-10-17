import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;

if (!projectId) {
  try {
    const configPath = path.resolve(__dirname, '../../firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      projectId = config.projectId;
    }
  } catch (err) {
    console.warn('Failed to parse firebase-applet-config.json:', err);
  }
}

if (!getApps().length) {
  initializeApp({
    projectId: projectId || 'temporal-lane-kct7q',
  });
}

export const adminAuth = getAuth();
