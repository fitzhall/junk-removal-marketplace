# Junk Removal Quote Marketplace

AI-powered photo-based instant quote platform for junk removal services.

## Project Overview

A marketplace that connects customers needing junk removal with local service providers through AI-powered photo analysis and instant pricing.

### Key Features
- 📸 Photo-based quote generation using AI
- 💰 Instant pricing estimates
- 🗺️ Location-based provider matching
- 📱 Mobile-first responsive design
- 🚀 SEO-optimized landing pages

## Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod

### Backend
- **API:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **File Storage:** AWS S3 / Cloudinary
- **AI/ML:** OpenAI Vision API

### Infrastructure
- **Hosting:** Vercel
- **Database:** Supabase / Neon
- **CDN:** Cloudflare
- **Monitoring:** Sentry
- **Analytics:** Vercel Analytics

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- OpenAI API Key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/junk-removal-marketplace.git
cd junk-removal-marketplace
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run database migrations:
```bash
npm run db:migrate
```

5. Start development server:
```bash
npm run dev
```

## Project Structure
```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (auth)/           # Auth pages
│   ├── (customer)/       # Customer-facing pages
│   ├── (provider)/       # Provider portal
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── features/         # Feature-specific components
│   └── layouts/          # Layout components
├── lib/                   # Utilities and helpers
│   ├── ai/               # AI/Vision processing
│   ├── pricing/          # Pricing engine
│   └── db/               # Database utilities
├── prisma/               # Database schema
├── public/               # Static assets
└── tests/                # Test files
```

## Development Workflow

### Branch Strategy
- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Commit Convention
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style
- `refactor:` Refactoring
- `test:` Tests
- `chore:` Maintenance

## API Documentation

See [API.md](./docs/API.md) for detailed API documentation.

## Database Schema

See [SCHEMA.md](./docs/SCHEMA.md) for database schema details.

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## License

This project is proprietary and confidential.

## Contact

For questions or support, contact: [your-email@example.com]