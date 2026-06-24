# 🚀 AI Startup Idea Validator

AI Startup Idea Validator is an AI-powered platform that helps entrepreneurs and students evaluate startup ideas through market analysis, SWOT analysis, revenue forecasting, investor readiness scoring, and AI-powered business guidance.

## 🌐 Live Demo

🚀 https://ai-idea-validator002.vercel.app

## ✨ Features

* Startup Idea Analysis
* SWOT Analysis
* Market Analysis
* Revenue Forecasting
* Investor Readiness Score
* Business Model Canvas
* AI Mentor
* PDF Report Export
* Admin Dashboard
* User Authentication

## 🛠️ Tech Stack

* Next.js
* React
* TypeScript
* Node.js
* Express.js
* PostgreSQL
* Prisma ORM
* OpenAI API
* Tailwind CSS

## Directory Structure

```
├── backend/                  # Express + TypeScript Server
│   ├── prisma/               # Prisma PostgreSQL database schema
│   ├── src/
│   │   ├── config/           # Database Client Singleton
│   │   ├── middleware/       # Auth validation & error handlers
│   │   ├── routes/           # REST APIs (auth, ideas, exports, mentor, admin)
│   │   ├── services/         # OpenAI integration & PDF compilation
│   │   └── index.ts          # Server entrypoint
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                 # Next.js 15 App Router Client
│   ├── src/
│   │   ├── app/              # Views (dashboard, validate, reports, mentor, admin)
│   │   ├── components/       # Custom Glassmorphic layout panels
│   │   └── lib/              # API Client helper
│   ├── Dockerfile
│   └── package.json
│
└── docker-compose.yml        # Multi-container orchestration (DB, API, Client)
```

---

## 👨‍💻 Author

**Deepak**

GitHub: https://github.com/Deepakch0wdary
