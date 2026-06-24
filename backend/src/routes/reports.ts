import { Router, Response, NextFunction } from 'express';
import prisma from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { generatePDFReport } from '../services/exportService.js';

const router = Router();

// EXPORT TO PDF
router.get('/:id/pdf', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const idea = await prisma.startupIdea.findUnique({
      where: { id },
      include: {
        report: true,
        swot: true,
        competitors: true,
        revenueForecast: true,
        riskReport: true,
        teamRecommendation: true,
        successPrediction: true,
        investorScore: true,
        businessModel: true,
        pitchDeck: true,
      }
    });

    if (!idea) {
      res.status(404).json({ error: 'Startup idea report not found' });
      return;
    }

    if (idea.userId !== req.user?.id && req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const pdfBuffer = await generatePDFReport(idea);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${idea.name.replace(/[^a-zA-Z0-9]/g, '_')}_validation_report.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
});

export default router;
