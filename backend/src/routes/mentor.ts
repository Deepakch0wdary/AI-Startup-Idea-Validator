import { Router, Response, NextFunction } from 'express';
import prisma from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { askMentor } from '../services/aiService.js';

const router = Router();

// ASK MENTOR A QUESTION (CONTEXT-AWARE & PERSISTED)
router.post('/:ideaId/ask', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ideaId } = req.params;
    const { mentorRole, message } = req.body;

    if (!mentorRole || !message) {
      res.status(400).json({ error: 'mentorRole and message are required' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const mentorResponse = await askMentor(req.user.id, ideaId, mentorRole, message);

    res.json({ response: mentorResponse });
  } catch (error) {
    next(error);
  }
});

// FETCH CHAT HISTORY FOR AN IDEA & MENTOR ROLE
router.get('/:ideaId/history', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ideaId } = req.params;
    const { mentorRole } = req.query;

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const history = await prisma.chatHistory.findMany({
      where: {
        userId: req.user.id,
        mentorRole: mentorRole ? (mentorRole as string) : undefined,
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(history);
  } catch (error) {
    next(error);
  }
});

export default router;
