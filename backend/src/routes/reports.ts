import { Router, Response, NextFunction } from 'express';
import prisma from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { generatePDFReport, generateDOCXReport, generatePPTPitchDeck } from '../services/exportService.js';

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

// EXPORT TO DOCX
router.get('/:id/docx', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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

    const docxBuffer = await generateDOCXReport(idea);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${idea.name.replace(/[^a-zA-Z0-9]/g, '_')}_validation_report.docx"`);
    res.send(docxBuffer);
  } catch (error) {
    next(error);
  }
});

// EXPORT TO PPTX (PITCH DECK)
router.get('/:id/pptx', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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

    const pptxBuffer = await generatePPTPitchDeck(idea);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${idea.name.replace(/[^a-zA-Z0-9]/g, '_')}_pitch_deck.pptx"`);
    res.send(pptxBuffer);
  } catch (error) {
    next(error);
  }
});

export default router;
