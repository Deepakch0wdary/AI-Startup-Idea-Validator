import { Router, Response, NextFunction } from 'express';
import prisma from '../config/db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { generateValidationReport } from '../services/aiService.js';

const router = Router();

// SUBMIT & VALIDATE STARTUP IDEA
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, industry, targetCustomers, countryRegion, problemStatement, solution } = req.body;

    if (!name || !industry || !targetCustomers || !countryRegion || !problemStatement || !solution) {
      res.status(400).json({ error: 'All fields are required to validate startup idea' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Call AI Generation (or dynamic fallback)
    const reportData = await generateValidationReport({
      name,
      industry,
      targetCustomers,
      countryRegion,
      problemStatement,
      solution
    });

    // Write all database associations transactionally
    const idea = await prisma.startupIdea.create({
      data: {
        userId: req.user.id,
        name,
        industry,
        targetCustomers,
        countryRegion,
        problemStatement,
        solution,
        report: {
          create: {
            businessOverview: reportData.report.businessOverview,
            valueProposition: reportData.report.valueProposition,
            problemSolved: reportData.report.problemSolved,
          }
        },
        swot: {
          create: {
            strengths: reportData.swot.strengths,
            weaknesses: reportData.swot.weaknesses,
            opportunities: reportData.swot.opportunities,
            threats: reportData.swot.threats,
          }
        },
        competitors: {
          create: reportData.competitors.map((c: any) => ({
            name: c.name,
            type: c.type,
            strengths: c.strengths,
            weaknesses: c.weaknesses,
            advantages: c.advantages,
          }))
        },
        revenueForecast: {
          create: {
            pricingModel: reportData.revenueForecast.pricingModel,
            streams: reportData.revenueForecast.streams,
            mrrForecast: reportData.revenueForecast.mrrForecast,
            arrForecast: reportData.revenueForecast.arrForecast,
          }
        },
        riskReport: {
          create: {
            technicalRisk: reportData.riskReport.technicalRisk,
            financialRisk: reportData.riskReport.financialRisk,
            adoptionRisk: reportData.riskReport.adoptionRisk,
            marketRisk: reportData.riskReport.marketRisk,
          }
        },
        teamRecommendation: {
          create: {
            roles: reportData.teamRecommendation.roles,
          }
        },
        successPrediction: {
          create: {
            successProbability: reportData.successPrediction.successProbability,
            failureRisk: reportData.successPrediction.failureRisk,
            growthPotential: reportData.successPrediction.growthPotential,
            justification: reportData.successPrediction.justification,
          }
        },
        investorScore: {
          create: {
            investorScore: reportData.investorScore.investorScore,
            scalabilityScore: reportData.investorScore.scalabilityScore,
            fundingReadiness: reportData.investorScore.fundingReadiness,
            marketFitScore: reportData.investorScore.marketFitScore,
            investmentRecommendation: reportData.investorScore.investmentRecommendation,
          }
        },
        businessModel: {
          create: {
            keyPartners: reportData.businessModel.keyPartners,
            keyActivities: reportData.businessModel.keyActivities,
            keyResources: reportData.businessModel.keyResources,
            valuePropositions: reportData.businessModel.valuePropositions,
            customerRelationships: reportData.businessModel.customerRelationships,
            channels: reportData.businessModel.channels,
            customerSegments: reportData.businessModel.customerSegments,
            costStructure: reportData.businessModel.costStructure,
            revenueStreams: reportData.businessModel.revenueStreams,
          }
        },
        pitchDeck: {
          create: {
            slides: reportData.pitchDeck.slides,
          }
        }
      },
      include: {
        report: true,
      }
    });

    res.status(201).json({ message: 'Startup report generated successfully', ideaId: idea.id });
  } catch (error) {
    next(error);
  }
});

// GET USER'S STARTUP IDEAS (LIST + SEARCH)
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { search } = req.query;

    const ideas = await prisma.startupIdea.findMany({
      where: {
        userId: req.user.id,
        OR: search ? [
          { name: { contains: search as string, mode: 'insensitive' } },
          { industry: { contains: search as string, mode: 'insensitive' } },
        ] : undefined,
      },
      include: {
        successPrediction: { select: { successProbability: true } },
        investorScore: { select: { investorScore: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(ideas);
  } catch (error) {
    next(error);
  }
});

// GET SPECIFIC STARTUP IDEA (FULL DATA)
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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

    // Authorize user or let admin view it
    if (idea.userId !== req.user?.id && req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    res.json(idea);
  } catch (error) {
    next(error);
  }
});

// EDIT STARTUP IDEA REPORT DETAILS
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, industry, targetCustomers, countryRegion, problemStatement, solution, report, swot, competitors, riskReport, businessModel } = req.body;

    const idea = await prisma.startupIdea.findUnique({ where: { id } });
    if (!idea) {
      res.status(404).json({ error: 'Startup idea report not found' });
      return;
    }

    if (idea.userId !== req.user?.id && req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    // Perform updates
    await prisma.$transaction([
      prisma.startupIdea.update({
        where: { id },
        data: { name, industry, targetCustomers, countryRegion, problemStatement, solution }
      }),
      ...(report ? [
        prisma.report.update({
          where: { ideaId: id },
          data: {
            businessOverview: report.businessOverview,
            valueProposition: report.valueProposition,
            problemSolved: report.problemSolved,
          }
        })
      ] : []),
      ...(swot ? [
        prisma.sWOTReport.update({
          where: { ideaId: id },
          data: {
            strengths: swot.strengths,
            weaknesses: swot.weaknesses,
            opportunities: swot.opportunities,
            threats: swot.threats,
          }
        })
      ] : []),
      ...(riskReport ? [
        prisma.riskReport.update({
          where: { ideaId: id },
          data: {
            technicalRisk: riskReport.technicalRisk,
            financialRisk: riskReport.financialRisk,
            adoptionRisk: riskReport.adoptionRisk,
            marketRisk: riskReport.marketRisk,
          }
        })
      ] : []),
      ...(businessModel ? [
        prisma.businessModelCanvas.update({
          where: { ideaId: id },
          data: {
            keyPartners: businessModel.keyPartners,
            keyActivities: businessModel.keyActivities,
            keyResources: businessModel.keyResources,
            valuePropositions: businessModel.valuePropositions,
            customerRelationships: businessModel.customerRelationships,
            channels: businessModel.channels,
            customerSegments: businessModel.customerSegments,
            costStructure: businessModel.costStructure,
            revenueStreams: businessModel.revenueStreams,
          }
        })
      ] : []),
    ]);

    res.json({ message: 'Startup report updated successfully' });
  } catch (error) {
    next(error);
  }
});

// DUPLICATE STARTUP IDEA
router.post('/:id/duplicate', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const source = await prisma.startupIdea.findUnique({
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

    if (!source) {
      res.status(404).json({ error: 'Source report not found' });
      return;
    }

    if (source.userId !== req.user?.id && req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    const copy = await prisma.startupIdea.create({
      data: {
        userId: req.user.id,
        name: `${source.name} (Copy)`,
        industry: source.industry,
        targetCustomers: source.targetCustomers,
        countryRegion: source.countryRegion,
        problemStatement: source.problemStatement,
        solution: source.solution,
        report: source.report ? {
          create: {
            businessOverview: source.report.businessOverview,
            valueProposition: source.report.valueProposition,
            problemSolved: source.report.problemSolved,
          }
        } : undefined,
        swot: source.swot ? {
          create: {
            strengths: source.swot.strengths,
            weaknesses: source.swot.weaknesses,
            opportunities: source.swot.opportunities,
            threats: source.swot.threats,
          }
        } : undefined,
        competitors: source.competitors ? {
          create: source.competitors.map((c) => ({
            name: c.name,
            type: c.type,
            strengths: c.strengths,
            weaknesses: c.weaknesses,
            advantages: c.advantages,
          }))
        } : undefined,
        revenueForecast: source.revenueForecast ? {
          create: {
            pricingModel: source.revenueForecast.pricingModel,
            streams: source.revenueForecast.streams,
            mrrForecast: source.revenueForecast.mrrForecast || {},
            arrForecast: source.revenueForecast.arrForecast || {},
          }
        } : undefined,
        riskReport: source.riskReport ? {
          create: {
            technicalRisk: source.riskReport.technicalRisk,
            financialRisk: source.riskReport.financialRisk,
            adoptionRisk: source.riskReport.adoptionRisk,
            marketRisk: source.riskReport.marketRisk,
          }
        } : undefined,
        teamRecommendation: source.teamRecommendation ? {
          create: {
            roles: source.teamRecommendation.roles || {},
          }
        } : undefined,
        successPrediction: source.successPrediction ? {
          create: {
            successProbability: source.successPrediction.successProbability,
            failureRisk: source.successPrediction.failureRisk,
            growthPotential: source.successPrediction.growthPotential,
            justification: source.successPrediction.justification,
          }
        } : undefined,
        investorScore: source.investorScore ? {
          create: {
            investorScore: source.investorScore.investorScore,
            scalabilityScore: source.investorScore.scalabilityScore,
            fundingReadiness: source.investorScore.fundingReadiness,
            marketFitScore: source.investorScore.marketFitScore,
            investmentRecommendation: source.investorScore.investmentRecommendation,
          }
        } : undefined,
        businessModel: source.businessModel ? {
          create: {
            keyPartners: source.businessModel.keyPartners,
            keyActivities: source.businessModel.keyActivities,
            keyResources: source.businessModel.keyResources,
            valuePropositions: source.businessModel.valuePropositions,
            customerRelationships: source.businessModel.customerRelationships,
            channels: source.businessModel.channels,
            customerSegments: source.businessModel.customerSegments,
            costStructure: source.businessModel.costStructure,
            revenueStreams: source.businessModel.revenueStreams,
          }
        } : undefined,
        pitchDeck: source.pitchDeck ? {
          create: {
            slides: source.pitchDeck.slides || {},
          }
        } : undefined,
      }
    });

    res.json({ message: 'Startup report duplicated successfully', duplicateId: copy.id });
  } catch (error) {
    next(error);
  }
});

// DELETE STARTUP IDEA
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const idea = await prisma.startupIdea.findUnique({ where: { id } });
    if (!idea) {
      res.status(404).json({ error: 'Startup idea report not found' });
      return;
    }

    if (idea.userId !== req.user?.id && req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    await prisma.startupIdea.delete({ where: { id } });
    res.json({ message: 'Startup report deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
