import { Router } from 'express';
import { executeCode, getSupportedLanguages } from '../services/executionService.js';
import { executionLimiter } from '../middleware/rateLimiter.js';
import { getDocText } from '../socket/yjsHandler.js';

export const executeRouter = Router();

// Execute code
executeRouter.post('/', executionLimiter, async (req, res) => {
  try {
    const { code, language, stdin, roomId } = req.body;

    // Use provided code or pull from the live Y.Doc
    const codeToRun = code || (roomId ? getDocText(roomId) : '');

    if (!codeToRun || typeof codeToRun !== 'string') {
      res.status(400).json({ error: 'No code to execute' });
      return;
    }

    if (!language || !getSupportedLanguages().includes(language)) {
      res.status(400).json({ error: `Unsupported language. Supported: ${getSupportedLanguages().join(', ')}` });
      return;
    }

    if (codeToRun.length > 50000) {
      res.status(400).json({ error: 'Code exceeds maximum length of 50,000 characters' });
      return;
    }

    const result = await executeCode(codeToRun, language, stdin);
    res.json(result);
  } catch (err: any) {
    console.error('Execute error:', err);
    res.status(500).json({ error: err.message || 'Execution failed' });
  }
});

// Get supported languages
executeRouter.get('/languages', (_req, res) => {
  res.json({ languages: getSupportedLanguages() });
});
