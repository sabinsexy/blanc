# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js application configured for deployment on Cloudflare Workers using OpenNextJS. The project features:

- **Framework**: Next.js 15.4.6 with React 19 and TypeScript
- **Deployment**: Cloudflare Workers via OpenNextJS
- **Database**: PostgreSQL with Prisma ORM and Accelerate extension
- **Authentication**: Better-auth with SIWE (Sign-In with Ethereum) plugin
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Development**: Turbopack for fast development builds

## Essential Commands

### Development
```bash
npm run dev              # Start development server with Turbopack
npm run build            # Build for production
npm run lint             # Run ESLint
npm run start            # Start production server locally
```

### Deployment
```bash
npm run deploy           # Build and deploy to Cloudflare Workers
npm run preview          # Build and preview deployment locally
npm run cf-typegen       # Generate Cloudflare environment types
```

## Architecture

### Database Architecture
- **ORM**: Prisma with PostgreSQL
- **Client Generation**: Custom output path `../app/generated/prisma`
- **Extensions**: Prisma Accelerate for performance optimization
- **Models**: User, Session, Account, Verification, WalletAddress
- **Authentication Schema**: Designed for better-auth integration with SIWE support

### Authentication System
- **Library**: better-auth with Prisma adapter
- **Features**: SIWE (Sign-In with Ethereum) authentication
- **Wallet Support**: Multiple wallet addresses per user with chain ID tracking
- **Security**: Session-based authentication with token management

### Deployment Architecture
- **Platform**: Cloudflare Workers
- **Build Tool**: OpenNextJS Cloudflare adapter
- **Assets**: Static assets served via Cloudflare binding
- **Configuration**: Wrangler for worker management

### Frontend Architecture
- **UI Framework**: shadcn/ui with "new-york" style
- **Styling**: Tailwind CSS with CSS variables
- **Icons**: Lucide React
- **Path Aliases**: `@/*` maps to `./src/*`

## Key Configuration Files

- `prisma/schema.prisma` - Database schema with better-auth models
- `src/lib/auth.ts` - Authentication configuration with SIWE setup
- `src/lib/prisma.ts` - Prisma client with Accelerate extension
- `open-next.config.ts` - OpenNextJS Cloudflare configuration
- `wrangler.jsonc` - Cloudflare Workers configuration
- `components.json` - shadcn/ui configuration

## Development Notes

- Prisma client is generated to a custom path: `app/generated/prisma`
- Use `@/*` imports for src directory files
- SIWE configuration requires domain and nonce generation setup
- Cloudflare environment types are generated via `cf-typegen` command
- Development uses Turbopack for faster builds