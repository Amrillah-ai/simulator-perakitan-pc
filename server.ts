import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { requireAuth, type AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser, saveExamResult, getUserExamResults } from './src/db/users.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API routes
app.get('/api/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email;
    const displayName = (req.user as any)?.name || null;

    if (!uid || !email) {
      return res.status(400).json({ error: 'Missing user credentials in token' });
    }

    const user = await getOrCreateUser(uid, email, displayName);
    res.json(user);
  } catch (error: any) {
    console.error('Error fetching/creating user:', error);
    res.status(500).json({ error: 'Failed to synchronize user profile' });
  }
});

app.get('/api/exam-results', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email;
    if (!uid || !email) {
      return res.status(400).json({ error: 'Missing user credentials' });
    }
    const user = await getOrCreateUser(uid, email);
    const results = await getUserExamResults(user.id);
    res.json(results);
  } catch (error: any) {
    console.error('Error fetching exam results:', error);
    res.status(500).json({ error: 'Failed to fetch exam results' });
  }
});

app.post('/api/exam-results', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email;
    if (!uid || !email) {
      return res.status(400).json({ error: 'Missing user credentials' });
    }
    const user = await getOrCreateUser(uid, email);
    const {
      studentName,
      studentClass,
      scenarioId,
      scenarioTitle,
      scoreTotal,
      scoreSop,
      scoreSafety,
      scoreAccuracy,
      scorePost,
      timeSpentSeconds,
      grade,
      feedback,
    } = req.body;

    const saved = await saveExamResult({
      userId: user.id,
      studentName: studentName || 'Siswa',
      studentClass: studentClass || 'Kelas X',
      scenarioId: scenarioId || 'custom',
      scenarioTitle: scenarioTitle || 'Perakitan Mandiri',
      scoreTotal: Number(scoreTotal) || 0,
      scoreSop: Number(scoreSop) || 0,
      scoreSafety: Number(scoreSafety) || 0,
      scoreAccuracy: Number(scoreAccuracy) || 0,
      scorePost: Number(scorePost) || 0,
      timeSpentSeconds: Number(timeSpentSeconds) || 0,
      grade: grade || 'B',
      feedback: feedback || '',
    });

    res.json(saved);
  } catch (error: any) {
    console.error('Error saving exam result:', error);
    res.status(500).json({ error: 'Failed to save exam result' });
  }
});

// Vite middleware for dev or static server for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
