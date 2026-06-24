import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const DATABASE_URL = process.env.DATABASE_URL;

// Check if we should use Mock DB
const shouldMock = !DATABASE_URL || DATABASE_URL.includes("localhost:5432") || process.env.USE_MOCK_DB === 'true';

// In-Memory Database Store
const store = {
  users: [] as any[],
  subscriptions: [] as any[],
  ideas: [] as any[],
  reports: [] as any[],
  swots: [] as any[],
  competitors: [] as any[],
  revenues: [] as any[],
  risks: [] as any[],
  teams: [] as any[],
  success: [] as any[],
  investors: [] as any[],
  canvases: [] as any[],
  decks: [] as any[],
  chats: [] as any[],
};

// Mock Helper functions
const mockUser = {
  findUnique: async (args: any) => {
    const { email, id, googleId } = args.where;
    const found = store.users.find(u => 
      (email && u.email === email) || 
      (id && u.id === id) || 
      (googleId && u.googleId === googleId)
    );
    if (!found) return null;
    
    // Attach relations if requested
    const copy = { ...found } as any;
    if (args.include?.subscription) {
      copy.subscription = store.subscriptions.find(s => s.userId === copy.id) || null;
    }
    return copy;
  },
  create: async (args: any) => {
    const newUser = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      email: args.data.email,
      passwordHash: args.data.passwordHash || null,
      name: args.data.name,
      role: args.data.role || 'USER',
      googleId: args.data.googleId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.users.push(newUser);

    if (args.data.subscription?.create) {
      const sub = {
        id: `sub_${Math.random().toString(36).substring(2, 9)}`,
        userId: newUser.id,
        plan: args.data.subscription.create.plan || 'FREE',
        status: args.data.subscription.create.status || 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.subscriptions.push(sub);
    }

    const copy = { ...newUser } as any;
    if (args.include?.subscription) {
      copy.subscription = store.subscriptions.find(s => s.userId === copy.id) || null;
    }
    return copy;
  },
  count: async () => {
    return store.users.length;
  },
  findMany: async (args: any) => {
    return store.users.map(u => {
      const sub = store.subscriptions.find(s => s.userId === u.id) || null;
      const ideas = store.ideas.filter(i => i.userId === u.id);
      const chats = store.chats.filter(c => c.userId === u.id);
      return {
        ...u,
        subscription: sub,
        _count: {
          ideas: ideas.length,
          chats: chats.length,
        }
      };
    });
  },
  delete: async (args: any) => {
    const { id } = args.where;
    store.users = store.users.filter(u => u.id !== id);
    store.ideas = store.ideas.filter(i => i.userId !== id);
    store.chats = store.chats.filter(c => c.userId !== id);
    return { id };
  },
  update: async (args: any) => {
    const { id } = args.where;
    const userIdx = store.users.findIndex(u => u.id === id);
    if (userIdx !== -1) {
      store.users[userIdx] = { ...store.users[userIdx], ...args.data, updatedAt: new Date() };
      return store.users[userIdx];
    }
    throw new Error('User not found');
  }
};

const mockSubscription = {
  upsert: async (args: any) => {
    const { userId } = args.where;
    const existingIdx = store.subscriptions.findIndex(s => s.userId === userId);
    if (existingIdx !== -1) {
      store.subscriptions[existingIdx] = { 
        ...store.subscriptions[existingIdx], 
        ...args.update, 
        updatedAt: new Date() 
      };
      return store.subscriptions[existingIdx];
    } else {
      const newSub = {
        id: `sub_${Math.random().toString(36).substring(2, 9)}`,
        userId,
        plan: args.create.plan || 'FREE',
        status: args.create.status || 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      store.subscriptions.push(newSub);
      return newSub;
    }
  },
  groupBy: async (args: any) => {
    const counts: Record<string, number> = { FREE: 0, PRO: 0, ENTERPRISE: 0 };
    store.subscriptions.forEach(s => {
      counts[s.plan] = (counts[s.plan] || 0) + 1;
    });
    return Object.keys(counts).map(plan => ({
      plan,
      _count: {
        plan: counts[plan]
      }
    }));
  }
};

const mockStartupIdea = {
  create: async (args: any) => {
    const newIdea = {
      id: `idea_${Math.random().toString(36).substring(2, 9)}`,
      userId: args.data.userId,
      name: args.data.name,
      industry: args.data.industry,
      targetCustomers: args.data.targetCustomers,
      countryRegion: args.data.countryRegion,
      problemStatement: args.data.problemStatement,
      solution: args.data.solution,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    store.ideas.push(newIdea);

    // Create related items if specified
    if (args.data.report?.create) {
      store.reports.push({ id: `rep_${Math.random().toString(36).substring(2, 9)}`, ideaId: newIdea.id, ...args.data.report.create });
    }
    if (args.data.swot?.create) {
      store.swots.push({ id: `swot_${Math.random().toString(36).substring(2, 9)}`, ideaId: newIdea.id, ...args.data.swot.create });
    }
    if (args.data.competitors?.create) {
      const items = Array.isArray(args.data.competitors.create) ? args.data.competitors.create : [args.data.competitors.create];
      items.forEach((c: any) => {
        store.competitors.push({ id: `comp_${Math.random().toString(36).substring(2, 9)}`, ideaId: newIdea.id, ...c });
      });
    }
    if (args.data.revenueForecast?.create) {
      store.revenues.push({ id: `rev_${Math.random().toString(36).substring(2, 9)}`, ideaId: newIdea.id, ...args.data.revenueForecast.create });
    }
    if (args.data.riskReport?.create) {
      store.risks.push({ id: `risk_${Math.random().toString(36).substring(2, 9)}`, ideaId: newIdea.id, ...args.data.riskReport.create });
    }
    if (args.data.teamRecommendation?.create) {
      store.teams.push({ id: `team_${Math.random().toString(36).substring(2, 9)}`, ideaId: newIdea.id, ...args.data.teamRecommendation.create });
    }
    if (args.data.successPrediction?.create) {
      store.success.push({ id: `succ_${Math.random().toString(36).substring(2, 9)}`, ideaId: newIdea.id, ...args.data.successPrediction.create });
    }
    if (args.data.investorScore?.create) {
      store.investors.push({ id: `inv_${Math.random().toString(36).substring(2, 9)}`, ideaId: newIdea.id, ...args.data.investorScore.create });
    }
    if (args.data.businessModel?.create) {
      store.canvases.push({ id: `canvas_${Math.random().toString(36).substring(2, 9)}`, ideaId: newIdea.id, ...args.data.businessModel.create });
    }
    if (args.data.pitchDeck?.create) {
      store.decks.push({ id: `deck_${Math.random().toString(36).substring(2, 9)}`, ideaId: newIdea.id, ...args.data.pitchDeck.create });
    }

    return { ...newIdea, report: store.reports.find(r => r.ideaId === newIdea.id) };
  },
  findMany: async (args: any) => {
    const { userId, OR } = args.where || {};
    let list = store.ideas.filter(i => !userId || i.userId === userId);
    
    if (OR) {
      const searchTerms = OR.map((term: any) => {
        const valKey = Object.keys(term)[0];
        return term[valKey]?.contains?.toLowerCase() || '';
      }).filter(Boolean);

      if (searchTerms.length > 0) {
        list = list.filter(i => 
          searchTerms.some((term: string) => 
            i.name.toLowerCase().includes(term) || 
            i.industry.toLowerCase().includes(term)
          )
        );
      }
    }

    return list.map(i => ({
      ...i,
      successPrediction: store.success.find(s => s.ideaId === i.id) || null,
      investorScore: store.investors.find(inv => inv.ideaId === i.id) || null,
    }));
  },
  findUnique: async (args: any) => {
    const { id } = args.where;
    const idea = store.ideas.find(i => i.id === id);
    if (!idea) return null;

    const copy = { ...idea };
    if (args.include?.report) copy.report = store.reports.find(r => r.ideaId === id) || null;
    if (args.include?.swot) copy.swot = store.swots.find(s => s.ideaId === id) || null;
    if (args.include?.competitors) copy.competitors = store.competitors.filter(c => c.ideaId === id);
    if (args.include?.revenueForecast) copy.revenueForecast = store.revenues.find(r => r.ideaId === id) || null;
    if (args.include?.riskReport) copy.riskReport = store.risks.find(r => r.ideaId === id) || null;
    if (args.include?.teamRecommendation) copy.teamRecommendation = store.teams.find(t => t.ideaId === id) || null;
    if (args.include?.successPrediction) copy.successPrediction = store.success.find(s => s.ideaId === id) || null;
    if (args.include?.investorScore) copy.investorScore = store.investors.find(inv => inv.ideaId === id) || null;
    if (args.include?.businessModel) copy.businessModel = store.canvases.find(c => c.ideaId === id) || null;
    if (args.include?.pitchDeck) copy.pitchDeck = store.decks.find(d => d.ideaId === id) || null;

    return copy;
  },
  update: async (args: any) => {
    const { id } = args.where;
    const ideaIdx = store.ideas.findIndex(i => i.id === id);
    if (ideaIdx !== -1) {
      store.ideas[ideaIdx] = { ...store.ideas[ideaIdx], ...args.data, updatedAt: new Date() };
      return store.ideas[ideaIdx];
    }
    throw new Error('Idea not found');
  },
  delete: async (args: any) => {
    const { id } = args.where;
    store.ideas = store.ideas.filter(i => i.id !== id);
    store.reports = store.reports.filter(r => r.ideaId !== id);
    store.swots = store.swots.filter(s => s.ideaId !== id);
    store.competitors = store.competitors.filter(c => c.ideaId !== id);
    store.revenues = store.revenues.filter(r => r.ideaId !== id);
    store.risks = store.risks.filter(r => r.ideaId !== id);
    store.teams = store.teams.filter(t => t.ideaId !== id);
    store.success = store.success.filter(s => s.ideaId !== id);
    store.investors = store.investors.filter(i => i.ideaId !== id);
    store.canvases = store.canvases.filter(c => c.ideaId !== id);
    store.decks = store.decks.filter(d => d.ideaId !== id);
    return { id };
  },
  count: async () => {
    return store.ideas.length;
  }
};

const mockReport = {
  update: async (args: any) => {
    const { ideaId } = args.where;
    const idx = store.reports.findIndex(r => r.ideaId === ideaId);
    if (idx !== -1) {
      store.reports[idx] = { ...store.reports[idx], ...args.data };
      return store.reports[idx];
    }
    return null;
  }
};

const mockSWOTReport = {
  update: async (args: any) => {
    const { ideaId } = args.where;
    const idx = store.swots.findIndex(s => s.ideaId === ideaId);
    if (idx !== -1) {
      store.swots[idx] = { ...store.swots[idx], ...args.data };
      return store.swots[idx];
    }
    return null;
  }
};

const mockRiskReport = {
  update: async (args: any) => {
    const { ideaId } = args.where;
    const idx = store.risks.findIndex(r => r.ideaId === ideaId);
    if (idx !== -1) {
      store.risks[idx] = { ...store.risks[idx], ...args.data };
      return store.risks[idx];
    }
    return null;
  }
};

const mockBusinessModelCanvas = {
  update: async (args: any) => {
    const { ideaId } = args.where;
    const idx = store.canvases.findIndex(c => c.ideaId === ideaId);
    if (idx !== -1) {
      store.canvases[idx] = { ...store.canvases[idx], ...args.data };
      return store.canvases[idx];
    }
    return null;
  }
};

const mockChatHistory = {
  create: async (args: any) => {
    const newChat = {
      id: `chat_${Math.random().toString(36).substring(2, 9)}`,
      userId: args.data.userId,
      role: args.data.role,
      content: args.data.content,
      mentorRole: args.data.mentorRole,
      createdAt: new Date()
    };
    store.chats.push(newChat);
    return newChat;
  },
  findMany: async (args: any) => {
    const { userId, mentorRole } = args.where || {};
    let list = store.chats.filter(c => c.userId === userId);
    if (mentorRole) {
      list = list.filter(c => c.mentorRole === mentorRole);
    }
    
    // Sort, limit
    const sorted = [...list].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    if (args.take) {
      return sorted.slice(-args.take);
    }
    return sorted;
  },
  count: async () => {
    return store.chats.length;
  }
};

// Database Proxy exports
const prismaClientMock = {
  user: mockUser,
  subscription: mockSubscription,
  startupIdea: mockStartupIdea,
  report: mockReport,
  sWOTReport: mockSWOTReport,
  riskReport: mockRiskReport,
  businessModelCanvas: mockBusinessModelCanvas,
  chatHistory: mockChatHistory,
  $transaction: async (queries: Promise<any>[]) => {
    return Promise.all(queries);
  },
  $connect: async () => {},
  $disconnect: async () => {}
};

// Decide connection type
let prisma: any;

if (shouldMock) {
  console.log("⚠️ ANTIGRAVITY DATABASE ENGINE: running with an active In-Memory DB local fallback.");
  prisma = prismaClientMock;
} else {
  console.log("🔌 ANTIGRAVITY DATABASE ENGINE: connecting to PostgreSQL production database...");
  prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

  if (process.env.NODE_ENV !== 'production') {
    globalThis.prismaGlobal = prisma;
  }
}

export default prisma;
