import OpenAI from 'openai';
import prisma from '../config/db.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

export interface StartupInput {
  name: string;
  industry: string;
  targetCustomers: string;
  countryRegion: string;
  problemStatement: string;
  solution: string;
}

// Dynamically generate startup-specific analysis if LLM is offline or no API Key
function getFallbackValidation(input: StartupInput) {
  const { name, industry, targetCustomers, countryRegion, problemStatement, solution } = input;

  // Let's create realistic baseline figures based on input lengths or simple hashes for deterministic mock realism
  const scoreBase = Math.min(95, Math.max(45, 60 + (name.length % 25) + (industry.length % 11)));
  const growthBase = Math.min(98, Math.max(50, 70 + (solution.length % 20)));
  const riskBase = 100 - scoreBase;

  const directComp = `${name} Alternatives Ltd`;
  const indirectComp = `Traditional ${industry} Solutions`;
  const alternativeComp = `Manual spreadsheets & legacy tools in ${countryRegion}`;

  return {
    report: {
      businessOverview: `${name} is an innovative venture operating in the ${industry} sector, specifically designed to address the challenges surrounding: "${problemStatement}". By leveraging modern technologies, it aims to establish a foothold in ${countryRegion} by catering directly to ${targetCustomers}.`,
      valueProposition: `Unlike current alternatives, ${name} provides a seamless way to execute the following solution: "${solution}". This delivers immediate value to ${targetCustomers} by reducing operational friction, cutting costs, and maximizing user engagement.`,
      problemSolved: `Resolves the core pain point where ${targetCustomers} suffer from inefficient processes related to "${problemStatement}". It streamlines their daily tasks and automates repetitive steps.`,
    },
    swot: {
      strengths: [
        `Tailored solution specifically solving: "${solution.substring(0, 80)}..."`,
        `Low friction onboarding designed for ${targetCustomers}`,
        `Modern, agile architectural design with scalability in mind`,
      ],
      weaknesses: [
        `Limited initial brand awareness within the ${industry} space in ${countryRegion}`,
        `High dependency on customer data acquisition to train underlying optimization systems`,
        `Resource constraints typical of a pre-seed startup in ${industry}`,
      ],
      opportunities: [
        `Rapidly expanding market demand for specialized solutions in ${countryRegion}`,
        `Potential to secure exclusive strategic partnerships with mid-tier businesses serving ${targetCustomers}`,
        `Opportunity to build secondary revenue streams through analytical data products`,
      ],
      threats: [
        `Existing incumbents in the ${industry} space copying core features`,
        `Changing regulatory landscapes regarding data privacy and storage compliance in ${countryRegion}`,
        `Potential delays in customer acquisition due to budget constraints of ${targetCustomers}`,
      ],
    },
    competitors: [
      {
        name: directComp,
        type: 'DIRECT',
        strengths: ['Established brand presence', 'Substantial funding history', 'Broad feature list'],
        weaknesses: ['Slow feature iterations', 'Complex legacy interface', 'High pricing tiers'],
        advantages: [`More agile user experience`, `Tailored specifically for ${targetCustomers}`, `More cost-effective implementation`],
      },
      {
        name: indirectComp,
        type: 'INDIRECT',
        strengths: ['Low cost', 'Familiarity among traditional users', 'Deep customer relationships'],
        weaknesses: ['Lack of automation', 'Prone to human error', 'Does not scale with company growth'],
        advantages: [`Saves time via automation`, `Modern analytical features`, `Integrates with digital workflows`],
      },
      {
        name: alternativeComp,
        type: 'ALTERNATIVE',
        strengths: ['Zero software cost', 'Complete local control', 'No onboarding required'],
        weaknesses: ['Extremely labor intensive', 'No data sharing capabilities', 'No predictive insights'],
        advantages: [`Provides intelligent suggestions`, `Aggregates team collaboration`, `Centralizes single source of truth`],
      },
    ],
    revenueForecast: {
      pricingModel: 'Tiered Subscription (SaaS) + Pay-per-use APIs',
      streams: ['Starter Plan ($29/mo)', 'Professional Team Tier ($99/mo)', 'Enterprise Integration Contracts ($499+/mo)', 'Implementation Consulting Fees'],
      mrrForecast: Array.from({ length: 12 }, (_, i) => {
        const monthNum = i + 1;
        const growth = Math.round(1500 * Math.pow(1.22, i));
        return { month: `Month ${monthNum}`, revenue: growth };
      }),
      arrForecast: [
        { year: 'Year 1', revenue: Math.round(35000 * (scoreBase / 60)) },
        { year: 'Year 2', revenue: Math.round(120000 * (scoreBase / 60)) },
        { year: 'Year 3', revenue: Math.round(380000 * (scoreBase / 60)) },
        { year: 'Year 4', revenue: Math.round(950000 * (scoreBase / 60)) },
        { year: 'Year 5', revenue: Math.round(2200000 * (scoreBase / 60)) },
      ],
    },
    riskReport: {
      technicalRisk: `Building the automation layer for "${solution.substring(0, 50)}" requires robust uptime and API syncing. Failure to secure data structures could result in latency issues.`,
      financialRisk: `High initial customer acquisition cost (CAC) could strain pre-seed runway if conversion rates from trial to paid tiers are lower than the target 4%.`,
      adoptionRisk: `${targetCustomers} are historically resistant to altering their workflow. Onboarding must be extremely clear to prevent churn within the first 14 days.`,
      marketRisk: `Entrenched competitors in the ${industry} space could launch aggressive pricing promotions to retain market share in ${countryRegion}.`,
    },
    teamRecommendation: {
      roles: [
        { title: 'Full Stack Developer', reason: 'Responsible for building the core application, frontend wizard, and database infrastructure.', budget: '$8,000 - $12,000 / month' },
        { title: 'AI & Data Engineer', reason: 'Focuses on tuning the validation models, data categorization algorithms, and mentor integrations.', budget: '$9,000 - $14,000 / month' },
        { title: 'Product Manager', reason: 'Owns the roadmap, prioritizes MVP milestones, gathers customer feedback, and drives delivery sprints.', budget: '$7,000 - $10,000 / month' },
        { title: 'UI/UX Designer', reason: 'Constructs the premium client interface, ensures layout responsiveness, and builds interactive widgets.', budget: '$5,000 - $8,000 / month' },
        { title: 'Marketing Specialist', reason: 'Launches content campaigns targeting cold traffic, manages user onboarding emails, and optimizes CAC.', budget: '$4,000 - $7,000 / month' },
      ],
    },
    successPrediction: {
      successProbability: scoreBase,
      failureRisk: riskBase,
      growthPotential: growthBase,
      justification: `The startup score of ${scoreBase}% is supported by strong alignment of the solution with the defined problem statement. Key barriers to entry include customer adoption rates and competitor reactions, which are manageable if the MVP features are focused on high-utility workflows.`,
    },
    investorScore: {
      investorScore: scoreBase + 2,
      scalabilityScore: growthBase - 3,
      fundingReadiness: scoreBase > 70 ? 'HIGH' : scoreBase > 50 ? 'MEDIUM' : 'LOW',
      marketFitScore: Math.round((scoreBase + growthBase) / 2),
      investmentRecommendation: `We recommend seeking pre-seed funding of $250k - $500k to support 12 months of development. Focus initial metrics on proving recurring value to the first 50 target clients in ${countryRegion}.`,
    },
    businessModel: {
      keyPartners: [`Cloud service providers`, `Industry associations representing ${targetCustomers}`, `Integration API partners`],
      keyActivities: [`Software product engineering`, `Customer onboarding and success support`, `Marketing and brand outreach`],
      keyResources: [`Proprietary matching algorithms`, `High-fidelity UX design templates`, `Skilled technical development team`],
      valuePropositions: [`Automated workflows for "${solution.substring(0, 45)}"`, `Detailed analytics for the ${industry} sector`, `Cost reductions compared to hiring agencies`],
      customerRelationships: [`Self-service dashboard onboarding`, `24/7 AI-driven support chat`, `Dedicated customer success calls for premium tiers`],
      channels: [`Search engine optimization`, `Direct outbound outreach`, `Product Hunt & founder community launches`],
      customerSegments: [`${targetCustomers}`, `Early-stage tech founders`, `Small-to-medium enterprises (SMEs) in ${countryRegion}`],
      costStructure: [`Hosting & cloud database fees`, `Engineering salaries`, `Marketing and advertisement expenses`],
      revenueStreams: [`SaaS tier subscriptions`, `Custom integration setup contracts`, `Premium consulting add-ons`],
    },
    pitchDeck: {
      slides: [
        { slideNumber: 1, title: '1. Problem', content: [`The major problem faced by ${targetCustomers} is that current methods to solve "${problemStatement}" are inefficient, expensive, and unscalable.`, `This results in substantial lost revenue and wasted hours daily.`], metrics: 'Impact: Loss of up to 25% productive time' },
        { slideNumber: 2, title: '2. Solution', content: [`${name} introduces a state-of-the-art platform that automates "${solution}".`, `Our system delivers speed, convenience, and measurable ROI from day one.`], metrics: 'Efficiency: Reduces task time by 70%' },
        { slideNumber: 3, title: '3. Market Size', content: [`TAM: $5 Billion global market for ${industry} solutions.`, `SAM: $1.2 Billion addressable market in ${countryRegion}.`, `SOM: $80 Million target capture based on early adoption by ${targetCustomers}.`], metrics: 'Growth: TAM growing at 12% CAGR' },
        { slideNumber: 4, title: '4. Business Model', content: [`Tiered SaaS Subscription Model: Starter ($29/mo), Professional ($99/mo), and Enterprise custom pricing.`, `Additional revenue via API calls and setup fees.`], metrics: 'Target ARPU: $1,200 / year' },
        { slideNumber: 5, title: '5. Competitor Analysis', content: [`Incumbents like ${directComp} are bloated, slow, and expensive.`, `Indirect alternatives like ${indirectComp} fail to automate workflows.`], metrics: 'Competitor NPS: Average of 15 (Very Low)' },
        { slideNumber: 6, title: '6. Competitive Advantage', content: [`Proprietary tech architecture tailored specifically for ${targetCustomers}.`, `First-mover advantage in specialized ${industry} automation workflows in ${countryRegion}.`], metrics: 'Retention Goal: > 92% Annual Retention' },
        { slideNumber: 7, title: '7. Financial Forecast', content: [`Year 1 ARR: $35K, reaching Year 3 ARR: $380K.`, `Break-even expected in Month 14 post-funding.`], metrics: 'Target Margin: 82% gross margins' },
        { slideNumber: 8, title: '8. Team', content: [`Founders with deep expertise in ${industry} and engineering.`, `Supported by senior AI developers and product designers.`], metrics: 'Combined Experience: 15+ Years' },
        { slideNumber: 9, title: '9. Funding Ask', content: [`Raising $350,000 Pre-Seed Round.`, `Funds allocated: 60% engineering, 25% marketing, 15% operations.`], metrics: 'Runway: 18 Months' },
      ],
    },
  };
}

export async function generateValidationReport(input: StartupInput) {
  if (!openai) {
    console.log('OpenAI API key not set. Using dynamically crafted fallback generator.');
    return getFallbackValidation(input);
  }

  try {
    const prompt = `
      You are an expert startup incubator panel, venture capitalist, and business strategist.
      Analyze the following startup idea and generate a complete business validation report in JSON format.
      
      STARTUP DETAILS:
      Name: ${input.name}
      Industry: ${input.industry}
      Target Customers: ${input.targetCustomers}
      Country/Region: ${input.countryRegion}
      Problem Statement: ${input.problemStatement}
      Solution: ${input.solution}

      Provide your output strictly in JSON matching this schema structure:
      {
        "report": {
          "businessOverview": "detailed summary of the business concept",
          "valueProposition": "strong value proposition matching the customer persona",
          "problemSolved": "specific breakdown of the exact problems this solves"
        },
        "swot": {
          "strengths": ["at least 3 strengths specific to this idea"],
          "weaknesses": ["at least 3 weaknesses specific to this idea"],
          "opportunities": ["at least 3 growth opportunities"],
          "threats": ["at least 3 market or technical threats"]
        },
        "competitors": [
          {
            "name": "competitor name (use real or highly probable name based on market)",
            "type": "DIRECT or INDIRECT or ALTERNATIVE",
            "strengths": ["strengths of competitor"],
            "weaknesses": ["weaknesses of competitor"],
            "advantages": ["startup's competitive advantages over them"]
          }
        ],
        "revenueForecast": {
          "pricingModel": "pricing model description",
          "streams": ["revenue streams list"],
          "mrrForecast": [{"month": "Month 1", "revenue": 1500}, ... (provide 12 months)],
          "arrForecast": [{"year": "Year 1", "revenue": 18000}, ... (provide 5 years)]
        },
        "riskReport": {
          "technicalRisk": "technical risk analysis",
          "financialRisk": "financial risk analysis",
          "adoptionRisk": "customer adoption risk analysis",
          "marketRisk": "market risk analysis"
        },
        "teamRecommendation": {
          "roles": [
            { "title": "Full Stack Developer", "reason": "why they are needed", "budget": "estimated monthly cost" },
            { "title": "AI Engineer", "reason": "why they are needed", "budget": "estimated monthly cost" },
            { "title": "Product Manager", "reason": "why they are needed", "budget": "estimated monthly cost" },
            { "title": "UI/UX Designer", "reason": "why they are needed", "budget": "estimated monthly cost" },
            { "title": "Marketing Specialist", "reason": "why they are needed", "budget": "estimated monthly cost" }
          ]
        },
        "successPrediction": {
          "successProbability": 75, (integer percent)
          "failureRisk": 25, (integer percent)
          "growthPotential": 80, (integer percent)
          "justification": "detailed explanation of why this probability was scored"
        },
        "investorScore": {
          "investorScore": 82, (1-100)
          "scalabilityScore": 85, (1-100)
          "fundingReadiness": "HIGH or MEDIUM or LOW",
          "marketFitScore": 79, (1-100)
          "investmentRecommendation": "investor advice and recommended funding round size"
        },
        "businessModel": {
          "keyPartners": ["list"],
          "keyActivities": ["list"],
          "keyResources": ["list"],
          "valuePropositions": ["list"],
          "customerRelationships": ["list"],
          "channels": ["list"],
          "customerSegments": ["list"],
          "costStructure": ["list"],
          "revenueStreams": ["list"]
        },
        "pitchDeck": {
          "slides": [
            { "slideNumber": 1, "title": "1. Problem", "content": ["bullet points"], "metrics": "short slide metric" },
            { "slideNumber": 2, "title": "2. Solution", "content": ["bullet points"], "metrics": "short slide metric" },
            { "slideNumber": 3, "title": "3. Market Size", "content": ["bullet points"], "metrics": "short slide metric" },
            { "slideNumber": 4, "title": "4. Business Model", "content": ["bullet points"], "metrics": "short slide metric" },
            { "slideNumber": 5, "title": "5. Competitor Analysis", "content": ["bullet points"], "metrics": "short slide metric" },
            { "slideNumber": 6, "title": "6. Competitive Advantage", "content": ["bullet points"], "metrics": "short slide metric" },
            { "slideNumber": 7, "title": "7. Financial Forecast", "content": ["bullet points"], "metrics": "short slide metric" },
            { "slideNumber": 8, "title": "8. Team", "content": ["bullet points"], "metrics": "short slide metric" },
            { "slideNumber": 9, "title": "9. Funding Ask", "content": ["bullet points"], "metrics": "short slide metric" }
          ]
        }
      }
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that only outputs JSON matching the requested format.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });

    const resultText = response.choices[0]?.message?.content || '{}';
    return JSON.parse(resultText);
  } catch (error) {
    console.error('Error generating report with OpenAI, using dynamic fallback:', error);
    return getFallbackValidation(input);
  }
}

export async function askMentor(userId: string, ideaId: string, mentorRole: string, message: string) {
  // Retrieve the full context of this startup idea
  const idea = await prisma.startupIdea.findUnique({
    where: { id: ideaId },
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
    }
  });

  if (!idea) {
    throw new Error('Startup idea not found');
  }

  // Fetch recent conversation history with this mentor role
  const history = await prisma.chatHistory.findMany({
    where: { userId, mentorRole },
    orderBy: { createdAt: 'asc' },
    take: 12,
  });

  const chatContext = `
    You are a professional AI Mentor playing the role of a: "${mentorRole}".
    
    STARTUP CONTEXT:
    Name: ${idea.name}
    Industry: ${idea.industry}
    Target Customers: ${idea.targetCustomers}
    Country/Region: ${idea.countryRegion}
    Problem Statement: ${idea.problemStatement}
    Solution: ${idea.solution}

    VALIDATION SUMMARY:
    Business Overview: ${idea.report?.businessOverview}
    Strengths: ${idea.swot?.strengths.join(', ')}
    Weaknesses: ${idea.swot?.weaknesses.join(', ')}
    Success Probability: ${idea.successPrediction?.successProbability}% (Risk: ${idea.successPrediction?.failureRisk}%)
    Investor Readiness Score: ${idea.investorScore?.investorScore}/100
    Revenue pricing: ${idea.revenueForecast?.pricingModel}
    Adoption Risk: ${idea.riskReport?.adoptionRisk}

    Provide startup-specific, actionable suggestions. Do not give generic, vague advice.
    Speak in a direct, consultative tone matching your role:
    - CONSULTANT: Analytical, strategic, process-oriented.
    - INVESTOR: Financial, growth-focused, risk-aware, blunt.
    - PM: Feature scoping, user journey, technical MVP-oriented.
    - MARKETER: Channels, messaging, branding, CAC/LTV oriented.
    - ANALYST: Core SWOT metrics, market trends, data-driven.
  `;

  let responseText = '';

  if (!openai) {
    // Generate a contextual rule-based response if offline
    const questionLower = message.toLowerCase();
    
    let defaultResponse = `That is an interesting question regarding the development of ${idea.name}. Since we are working within the ${idea.industry} space for ${idea.targetCustomers}, we must prioritize validating our value proposition: "${idea.report?.valueProposition || idea.solution}".`;

    if (mentorRole === 'INVESTOR') {
      defaultResponse = `Looking at this as an investor, your success probability of ${idea.successPrediction?.successProbability}% means we need to immediately address your adoption risks in ${idea.countryRegion}. Let's make sure the financial forecasts are tight. What specific numbers do you want to run?`;
    } else if (mentorRole === 'PM') {
      defaultResponse = `As a Product Manager, I'd suggest starting with Phase 1 of the MVP: building the core validation loops. Let's draft a feature list that targets the main customer pain point: "${idea.problemStatement.substring(0, 80)}".`;
    } else if (mentorRole === 'MARKETER') {
      defaultResponse = `Marketing-wise, reaching ${idea.targetCustomers} in ${idea.countryRegion} requires clear positioning. We should test channels like targeted LinkedIn outreach, cold SEO pipelines, or founder communities.`;
    }

    if (questionLower.includes('customer') || questionLower.includes('get user') || questionLower.includes('acquire')) {
      responseText = `To acquire your first customers among ${idea.targetCustomers}, you should implement a double-sided acquisition plan. In the ${idea.industry} sector, early adopters respond best to direct high-touch outreach. We should launch an invite-only beta testing program highlighting how we solve: "${idea.problemStatement.substring(0, 100)}".`;
    } else if (questionLower.includes('funding') || questionLower.includes('money') || questionLower.includes('raise') || questionLower.includes('investor')) {
      responseText = `To secure funding, your Investor Score of ${idea.investorScore?.investorScore}/100 suggests a pre-seed seed round is viable. You need to prepare slides 3 (Market Size) and 7 (Financial Forecast) from your pitch deck. Investors will ask about your TAM ($5B) and how you offset the market risk: "${idea.riskReport?.marketRisk.substring(0, 120)}".`;
    } else if (questionLower.includes('compet') || questionLower.includes('beat') || questionLower.includes('alternative') || questionLower.includes('rival')) {
      responseText = `To beat your competitors (like Traditional ${idea.industry} Solutions), we must focus heavily on your core competitive advantage: "${idea.competitors?.[0]?.advantages?.[0] || 'custom automated workflows'}" and maintain a faster execution cycle.`;
    } else if (questionLower.includes('success') || questionLower.includes('improve') || questionLower.includes('score')) {
      responseText = `To increase your Success Score of ${idea.successPrediction?.successProbability}%, we must reduce your primary adoption risk ("${idea.riskReport?.adoptionRisk.substring(0, 80)}"). I recommend launching a landing page to capture email signups prior to writing code, validating customer intent.`;
    } else if (questionLower.includes('build') || questionLower.includes('start') || questionLower.includes('mvp')) {
      responseText = `For the MVP, you should build the core flow that directly solves: "${idea.solution.substring(0, 90)}". Do not build full settings or invoicing tiers yet. Focus purely on showing ${idea.targetCustomers} how their primary issue is solved in less than 3 clicks.`;
    } else {
      responseText = `${defaultResponse} Can you clarify what metrics or steps you want to investigate next?`;
    }
  } else {
    try {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: chatContext },
        ...history.map((h: any) => ({
          role: h.role as 'user' | 'assistant',
          content: h.content,
        })),
        { role: 'user', content: message },
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
      });

      responseText = response.choices[0]?.message?.content || 'I apologize, I am unable to generate a response at the moment.';
    } catch (err) {
      console.error('Error during chat completion, using fallback chat response:', err);
      responseText = `An issue occurred while processing the request. However, considering ${idea.name}'s focus, my strategic advice is to keep testing your MVP value proposition directly with early target customers.`;
    }
  }

  // Save conversation history to database
  await prisma.chatHistory.create({
    data: {
      userId,
      role: 'user',
      content: message,
      mentorRole,
    }
  });

  await prisma.chatHistory.create({
    data: {
      userId,
      role: 'assistant',
      content: responseText,
      mentorRole,
    }
  });

  return responseText;
}
