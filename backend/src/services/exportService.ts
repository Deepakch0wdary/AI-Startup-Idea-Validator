import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, HeadingLevel } from 'docx';
import pptxgen from 'pptxgenjs';

export async function generatePDFReport(idea: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    // Cover Page
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0B0F19');
    
    doc.fillColor('#8B5CF6').fontSize(36).text('STARTUP VALIDATION REPORT', 50, 150, { align: 'center', stroke: true });
    doc.fillColor('#FFFFFF').fontSize(24).text(idea.name.toUpperCase(), 50, 210, { align: 'center' });
    
    doc.fillColor('#9CA3AF').fontSize(14).text(`Industry: ${idea.industry}`, 50, 280, { align: 'center' });
    doc.text(`Region: ${idea.countryRegion}`, 50, 300, { align: 'center' });
    doc.text(`Created For: ${idea.targetCustomers}`, 50, 320, { align: 'center' });

    doc.fillColor('#3B82F6').fontSize(12).text('POWERED BY ANTIGRAVITY AI ENGINE', 50, doc.page.height - 100, { align: 'center' });

    // Page 2: Summary & SWOT
    doc.addPage({ margin: 50 });
    doc.fillColor('#111827').rect(0, 0, doc.page.width, doc.page.height).fill(); // background
    
    doc.fillColor('#F3F4F6').fontSize(20).text('Executive Summary', 50, 50);
    doc.fontSize(12).fillColor('#D1D5DB').text(idea.report?.businessOverview || '', 50, 85, { width: 500, align: 'justify' });
    
    doc.fillColor('#F3F4F6').fontSize(16).text('Value Proposition', 50, 180);
    doc.fontSize(12).fillColor('#D1D5DB').text(idea.report?.valueProposition || '', 50, 210, { width: 500, align: 'justify' });

    doc.fillColor('#F3F4F6').fontSize(16).text('Core Problem Solved', 50, 290);
    doc.fontSize(12).fillColor('#D1D5DB').text(idea.report?.problemSolved || '', 50, 320, { width: 500, align: 'justify' });

    // SWOT
    doc.fillColor('#F3F4F6').fontSize(20).text('SWOT Analysis', 50, 430);
    let swotY = 465;
    if (idea.swot) {
      doc.fontSize(12);
      doc.fillColor('#34D399').text(`Strengths: ${idea.swot.strengths.join(', ')}`, 50, swotY, { width: 500 });
      doc.fillColor('#F87171').text(`Weaknesses: ${idea.swot.weaknesses.join(', ')}`, 50, swotY + 40, { width: 500 });
      doc.fillColor('#60A5FA').text(`Opportunities: ${idea.swot.opportunities.join(', ')}`, 50, swotY + 80, { width: 500 });
      doc.fillColor('#FBBF24').text(`Threats: ${idea.swot.threats.join(', ')}`, 50, swotY + 120, { width: 500 });
    }

    // Page 3: Market & Competitors
    doc.addPage();
    doc.fillColor('#111827').rect(0, 0, doc.page.width, doc.page.height).fill();
    
    doc.fillColor('#F3F4F6').fontSize(20).text('Market Analysis & Forecast', 50, 50);
    if (idea.successPrediction) {
      doc.fontSize(12).fillColor('#D1D5DB').text(`Success Probability: ${idea.successPrediction.successProbability}%`, 50, 85);
      doc.text(`Risk Score: ${idea.successPrediction.failureRisk}%`, 50, 105);
      doc.text(`Growth Potential: ${idea.successPrediction.growthPotential}%`, 50, 125);
      doc.text(`Market Fit Justification:`, 50, 155);
      doc.fontSize(11).fillColor('#9CA3AF').text(idea.successPrediction.justification, 50, 175, { width: 500 });
    }

    // Competitors
    doc.fillColor('#F3F4F6').fontSize(18).text('Competitor Landscape', 50, 310);
    let compY = 345;
    if (idea.competitors && idea.competitors.length > 0) {
      idea.competitors.forEach((c: any, index: number) => {
        doc.fontSize(12).fillColor('#FFFFFF').text(`${index + 1}. ${c.name} (${c.type})`, 50, compY);
        doc.fontSize(10).fillColor('#9CA3AF').text(`Advantages: ${c.advantages.join(', ')}`, 70, compY + 15);
        compY += 45;
      });
    }

    // Page 4: Financial & Risk
    doc.addPage();
    doc.fillColor('#111827').rect(0, 0, doc.page.width, doc.page.height).fill();
    
    doc.fillColor('#F3F4F6').fontSize(20).text('Revenue and Risk Metrics', 50, 50);
    if (idea.revenueForecast) {
      doc.fontSize(12).fillColor('#FFFFFF').text(`Pricing Model: ${idea.revenueForecast.pricingModel}`, 50, 85);
      doc.fontSize(11).fillColor('#D1D5DB').text(`Streams: ${idea.revenueForecast.streams.join(', ')}`, 50, 110);
    }

    if (idea.riskReport) {
      doc.fillColor('#F3F4F6').fontSize(16).text('Risk Matrix Breakdown', 50, 160);
      doc.fontSize(11).fillColor('#F87171').text(`Technical:`, 50, 190);
      doc.fillColor('#D1D5DB').text(idea.riskReport.technicalRisk, 120, 190, { width: 420 });

      doc.fillColor('#F87171').text(`Financial:`, 50, 240);
      doc.fillColor('#D1D5DB').text(idea.riskReport.financialRisk, 120, 240, { width: 420 });

      doc.fillColor('#F87171').text(`Adoption:`, 50, 290);
      doc.fillColor('#D1D5DB').text(idea.riskReport.adoptionRisk, 120, 290, { width: 420 });

      doc.fillColor('#F87171').text(`Market:`, 50, 340);
      doc.fillColor('#D1D5DB').text(idea.riskReport.marketRisk, 120, 340, { width: 420 });
    }

    // Team structure
    if (idea.teamRecommendation && idea.teamRecommendation.roles) {
      doc.fillColor('#F3F4F6').fontSize(16).text('Team Composition', 50, 420);
      let teamY = 450;
      const roles = idea.teamRecommendation.roles as any[];
      roles.slice(0, 4).forEach((role: any) => {
        doc.fontSize(11).fillColor('#FFFFFF').text(role.title, 50, teamY);
        doc.fontSize(10).fillColor('#9CA3AF').text(`Cost: ${role.budget}`, 200, teamY);
        teamY += 20;
      });
    }

    doc.end();
  });
}

export async function generateDOCXReport(idea: any): Promise<Buffer> {
  const bulletPoint = (text: string) => {
    return new Paragraph({
      children: [new TextRun({ text: `• ${text}`, color: '333333', size: 22 })],
      spacing: { after: 100 },
    });
  };

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'STARTUP VALIDATION REPORT',
                bold: true,
                color: '8B5CF6',
                size: 36,
              }),
            ],
            spacing: { before: 1000, after: 200 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: idea.name.toUpperCase(),
                bold: true,
                size: 28,
                color: '111827',
              }),
            ],
            spacing: { after: 600 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `Industry: ${idea.industry} | Country: ${idea.countryRegion}`, size: 24, italics: true, color: '666666' }),
            ],
            spacing: { after: 2000 },
          }),

          // Executive Summary
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: '1. Executive Summary', bold: true, size: 28, color: '8B5CF6' })],
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: idea.report?.businessOverview || '', size: 24 })],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Value Proposition: ${idea.report?.valueProposition || ''}`, size: 24 })],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Problem Solved: ${idea.report?.problemSolved || ''}`, size: 24 })],
            spacing: { after: 400 },
          }),

          // SWOT
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: '2. SWOT Analysis', bold: true, size: 28, color: '8B5CF6' })],
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({ children: [new TextRun({ text: 'Strengths:', bold: true, size: 24, color: '10B981' })] }),
          ...(idea.swot?.strengths.map(bulletPoint) || []),
          new Paragraph({ children: [new TextRun({ text: 'Weaknesses:', bold: true, size: 24, color: 'EF4444' })] }),
          ...(idea.swot?.weaknesses.map(bulletPoint) || []),
          new Paragraph({ children: [new TextRun({ text: 'Opportunities:', bold: true, size: 24, color: '3B82F6' })] }),
          ...(idea.swot?.opportunities.map(bulletPoint) || []),
          new Paragraph({ children: [new TextRun({ text: 'Threats:', bold: true, size: 24, color: 'F59E0B' })] }),
          ...(idea.swot?.threats.map(bulletPoint) || []),

          // Competitors
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: '3. Competitor Analysis', bold: true, size: 28, color: '8B5CF6' })],
            spacing: { before: 400, after: 200 },
          }),
          ...(idea.competitors?.map((c: any) => {
            return new Paragraph({
              children: [
                new TextRun({ text: `• ${c.name} (${c.type}): `, bold: true, size: 24 }),
                new TextRun({ text: `Advantages: ${c.advantages.join(', ')} | Weaknesses: ${c.weaknesses.join(', ')}`, size: 22 }),
              ],
              spacing: { after: 150 },
            });
          }) || []),

          // Revenue Model
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: '4. Revenue Potential', bold: true, size: 28, color: '8B5CF6' })],
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Pricing Model: ${idea.revenueForecast?.pricingModel || 'Subscription'}`, size: 24 }),
            ],
            spacing: { after: 200 },
          }),

          // Risks
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: '5. Risk Analysis', bold: true, size: 28, color: '8B5CF6' })],
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({ children: [new TextRun({ text: `Technical Risk: ${idea.riskReport?.technicalRisk || ''}`, size: 22 })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: `Financial Risk: ${idea.riskReport?.financialRisk || ''}`, size: 22 })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: `Adoption Risk: ${idea.riskReport?.adoptionRisk || ''}`, size: 22 })], spacing: { after: 100 } }),
          new Paragraph({ children: [new TextRun({ text: `Market Risk: ${idea.riskReport?.marketRisk || ''}`, size: 22 })], spacing: { after: 200 } }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

export async function generatePPTPitchDeck(idea: any): Promise<Buffer> {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';

  // 1. Cover / Title
  let slide = pptx.addSlide();
  slide.background = { color: '0B0F19' };
  slide.addText(`PITCH DECK: ${idea.name.toUpperCase()}`, {
    x: 0.5,
    y: 1.5,
    w: 9.0,
    h: 1.0,
    fontSize: 32,
    bold: true,
    color: '8B5CF6',
  });
  slide.addText(`Industry: ${idea.industry} | Country: ${idea.countryRegion}`, {
    x: 0.5,
    y: 2.5,
    w: 9.0,
    h: 0.5,
    fontSize: 18,
    color: '9CA3AF',
  });
  slide.addText('Generated by AI Startup Idea Validator', {
    x: 0.5,
    y: 5.0,
    w: 9.0,
    h: 0.4,
    fontSize: 12,
    color: '3B82F6',
  });

  // Pull slide items
  const slidesData = idea.pitchDeck?.slides || [];

  slidesData.forEach((s: any) => {
    const deckSlide = pptx.addSlide();
    deckSlide.background = { color: '111827' };
    
    // Header
    deckSlide.addText(s.title, {
      x: 0.5,
      y: 0.4,
      w: 9.0,
      h: 0.8,
      fontSize: 24,
      bold: true,
      color: '8B5CF6',
    });

    // Content bullets
    const bullets = s.content.map((point: string) => ({ text: point, options: { bullet: true, color: 'D1D5DB', fontSize: 16 } }));
    
    deckSlide.addText(bullets, {
      x: 0.5,
      y: 1.5,
      w: 8.5,
      h: 3.2,
    });

    // Metrics box at bottom
    if (s.metrics) {
      deckSlide.addText(s.metrics, {
        x: 0.5,
        y: 4.8,
        w: 9.0,
        h: 0.6,
        fontSize: 14,
        color: '10B981',
        bold: true,
      });
    }
  });

  const buffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer;
  return buffer;
}
