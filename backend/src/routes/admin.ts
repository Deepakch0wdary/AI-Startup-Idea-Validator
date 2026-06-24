import { Router, Response, NextFunction } from 'express';
import prisma from '../config/db.js';
import { authenticateToken, isAdmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET ALL USERS (ADMIN ONLY)
router.get('/users', authenticateToken, isAdmin, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      include: {
        subscription: true,
        _count: {
          select: { ideas: true, chats: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// DELETE A USER (ADMIN ONLY)
router.delete('/users/:id', authenticateToken, isAdmin, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Prevent deleting oneself
    if (id === req.user?.id) {
      res.status(400).json({ error: 'Cannot delete your own administrator account.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User account and all associated startup ideas deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// GET PLATFORM ANALYTICS (ADMIN ONLY)
router.get('/analytics', authenticateToken, isAdmin, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userCount = await prisma.user.count();
    const reportsCount = await prisma.startupIdea.count();
    const chatCount = await prisma.chatHistory.count();

    // Group subscriptions
    const subscriptions = await prisma.subscription.groupBy({
      by: ['plan'],
      _count: {
        plan: true
      }
    });

    const subStats = {
      FREE: 0,
      PRO: 0,
      ENTERPRISE: 0,
    };
    
    subscriptions.forEach((s: any) => {
      if (s.plan === 'FREE') subStats.FREE = s._count.plan;
      if (s.plan === 'PRO') subStats.PRO = s._count.plan;
      if (s.plan === 'ENTERPRISE') subStats.ENTERPRISE = s._count.plan;
    });

    // Recent items
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { name: true, email: true, role: true, createdAt: true }
    });

    const recentReports = await prisma.startupIdea.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { name: true, industry: true, countryRegion: true, createdAt: true }
    });

    res.json({
      summary: {
        totalUsers: userCount,
        totalReports: reportsCount,
        totalMentorQuestions: chatCount,
        aiTokenMockUsage: reportsCount * 25000 + chatCount * 450, // simulated tokens
      },
      subscriptions: subStats,
      recentUsers,
      recentReports,
    });
  } catch (error) {
    next(error);
  }
});

// UPDATE USER SUBSCRIPTION PLAN (ADMIN ONLY)
router.put('/subscriptions/:userId', authenticateToken, isAdmin, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const { plan } = req.body; // FREE, PRO, ENTERPRISE

    if (!['FREE', 'PRO', 'ENTERPRISE'].includes(plan)) {
      res.status(400).json({ error: 'Invalid plan selection' });
      return;
    }

    const updatedSub = await prisma.subscription.upsert({
      where: { userId },
      update: { plan },
      create: { userId, plan }
    });

    res.json({ message: 'User subscription plan updated successfully', subscription: updatedSub });
  } catch (error) {
    next(error);
  }
});

export default router;
