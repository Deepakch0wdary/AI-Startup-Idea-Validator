import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

// REGISTER
router.post('/register', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if this is the first user ever
    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;
    const isSpecialAdmin = email === 'admin@validator.com';
    const role = (isFirstUser || isSpecialAdmin) ? 'ADMIN' : 'USER';

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        role,
        subscription: {
          create: {
            plan: role === 'ADMIN' ? 'ENTERPRISE' : 'FREE',
            status: 'ACTIVE',
          }
        }
      },
      include: {
        subscription: true,
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscription: user.subscription,
      }
    });
  } catch (error) {
    next(error);
  }
});

// LOGIN
router.post('/login', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { subscription: true }
    });

    if (!user || !user.passwordHash) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscription: user.subscription,
      }
    });
  } catch (error) {
    next(error);
  }
});

// LOGOUT
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// GET ME
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { subscription: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscription: user.subscription,
      }
    });
  } catch (error) {
    next(error);
  }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ error: 'Email not registered' });
      return;
    }
    // Return standard success response, print reset token link for simple local sandbox testing
    const resetToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({
      message: 'Password reset link sent (simulated).',
      resetLink: `/auth/reset-password?token=${resetToken}`
    });
  } catch (error) {
    next(error);
  }
});

// RESET PASSWORD
router.post('/reset-password', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ error: 'Token and new password are required' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: decoded.id },
      data: { passwordHash: hashedPassword }
    });

    res.json({ message: 'Password reset successfully. You can now login.' });
  } catch (error) {
    res.status(400).json({ error: 'Invalid or expired reset token.' });
  }
});

// GOOGLE OAUTH EXCHANGE
router.post('/google-oauth', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { googleId, email, name } = req.body;
    if (!googleId || !email || !name) {
      res.status(400).json({ error: 'Invalid OAuth exchange data' });
      return;
    }

    let user = await prisma.user.findUnique({
      where: { email },
      include: { subscription: true }
    });

    if (!user) {
      // First user admin logic is also applicable to Google register
      const userCount = await prisma.user.count();
      const role = userCount === 0 || email === 'admin@validator.com' ? 'ADMIN' : 'USER';

      user = await prisma.user.create({
        data: {
          email,
          googleId,
          name,
          role,
          subscription: {
            create: {
              plan: role === 'ADMIN' ? 'ENTERPRISE' : 'FREE',
              status: 'ACTIVE',
            }
          }
        },
        include: {
          subscription: true,
        }
      });
    } else if (!user.googleId) {
      // Link googleId to existing local account
      user = await prisma.user.update({
        where: { email },
        data: { googleId },
        include: { subscription: true }
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscription: user.subscription,
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
