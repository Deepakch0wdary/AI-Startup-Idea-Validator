# AI Startup Idea Validator – Enterprise SaaS Platform

This platform is a complete enterprise-grade SaaS designed to help entrepreneurs, founders, accelerators, and investors validate startup concepts, analyze competitor matrices, forecast financials, map Business Model Canvases, and generate investor pitch decks using AI.

---

## Technical Architecture

The application is built in a decoupled monorepo structure:
- **Frontend (`frontend/`)**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS (for premium dark glassmorphism layout), Framer Motion, and Recharts (for TAM/SAM/SOM & financial charting).
- **Backend (`backend/`)**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL database, and OpenAI integration services.
- **Export Engine**: Implements binary compiling for **PDF** (`pdfkit`), **DOCX** (`docx`), and editable **PowerPoint Slides** (`pptxgenjs`).

---

## Directory Structure

```
├── backend/                  # Express + TypeScript Server
│   ├── prisma/               # Prisma PostgreSQL database schema
│   ├── src/
│   │   ├── config/           # Database Client Singleton
│   │   ├── middleware/       # Auth validation & error handlers
│   │   ├── routes/           # REST APIs (auth, ideas, exports, mentor, admin)
│   │   ├── services/         # OpenAI integration & PPT/DOC/PDF compilation
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

## Getting Started

### 1. Database & Environment Configuration

Ensure you have a PostgreSQL instance running. Or, you can start a PostgreSQL container using Docker:
```bash
docker-compose up -d db
```

#### Backend Setup (`backend/.env`):
Create a file named `.env` in the `backend/` directory with the following variables:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/validator?schema=public"
JWT_SECRET="your-jwt-signing-key"
OPENAI_API_KEY="your-openai-api-key"
FRONTEND_URL="http://localhost:3000"
```
*(If the `OPENAI_API_KEY` is not provided, the platform automatically activates a smart fallback generator. It parses your startup inputs programmatically to yield rich, industry-specific, realistic reports and advice so the app remains completely workable and functional offline).*

#### Frontend Setup (`frontend/.env.local`):
Create a file named `.env.local` in the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

### 2. Install Dependencies & Build

#### For the Backend:
```bash
cd backend
npm install
# Push the schema definitions to your PostgreSQL database
npx prisma db push
# Generate the Prisma client code bindings
npx prisma generate
```

#### For the Frontend:
```bash
cd frontend
npm install
```

---

### 3. Run Development Servers

Start the Express API:
```bash
cd backend
npm run dev
```

Start the Next.js client app:
```bash
cd frontend
npm run dev
```

Visit the application at `http://localhost:3000`.

---

## Evaluation & Administrative Access

- **Admin Account Creation**: The very first user to register on the platform is automatically assigned the **ADMIN** role. Alternatively, registering with the email **`admin@validator.com`** will also grant administrative credentials.
- **Admin Dashboard**: Once logged in as an administrator, you will see the **Admin Control** link in the header. From there, you can monitor system analytical metrics (user count, reports generated, mentor questions, mock AI token counts), view system logs, upgrade billing plans (FREE, PRO, ENTERPRISE), or delete profiles.
- **AI Mentor**: Fully operational contextual chatbot. Ask startup-specific questions (like *"How do I beat competitors?"* or *"What should I build first?"*) and receive detailed advice referencing your specific SWOT details, revenue models, and target region.

---

## Running with Docker Compose

To build and launch all services (PostgreSQL, Express API, Next.js client) simultaneously:
```bash
docker-compose up --build
```
The database will be initialized automatically, exposing the frontend on port `3000` and the backend server on port `5000`.
