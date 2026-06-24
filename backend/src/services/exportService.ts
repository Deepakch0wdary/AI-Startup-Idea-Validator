import PDFDocument from 'pdfkit';

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
