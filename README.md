<p align="center">
  <img src="/agent casha.png" alt="Agent Casha" width="220" />
</p>

<p align="center">
  AI-powered tool for Nigerian creators to turn rough product ideas into sellable digital products with AI-generated marketing copy, pricing, and full content.
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" />
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white" />
  <img alt="Clerk" src="https://img.shields.io/badge/Clerk-Auth-333333?logo=clerk" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Storage-3ECF8E?logo=supabase&logoColor=white" />
  <img alt="OpenRouter" src="https://img.shields.io/badge/OpenRouter-AI-4285F4" />
  <img alt="Locus" src="https://img.shields.io/badge/Locus-Checkout-6C5CE7" />
</p>

## Overview

Agent Casha helps Nigerian creators transform rough product ideas into polished digital products ready for sale. Users describe their product concept, and AI generates professional marketing copy, pricing recommendations, and full content.

The app combines:

- A public landing page
- A user-gated dashboard
- Product Builder with AI content generation
- Sales page preview and publishing
- USDC payments via Locus checkout

## What Casha Does

1. Captures product ideas via a guided form
2. Generates AI-powered marketing copy and pricing
3. Creates full product content with AI
4. Publishes shareable sales pages
5. Processes USDC payments via Locus
6. Delivers digital products to buyers

## Core Features

### Dashboard

- User-gated workspace
- Product management (create, edit, delete)
- AI content generation
- Sales page publishing

### Product Builder

- Product name and description input
- Pricing strategy with AI recommendations
- Target audience specification
- Marketing copy generation
- Full content generation with AI

### Sales Pages

- Public product pages
- Checkout integration via Locus
- Success page with download delivery
- Link sharing for creators

### Checkout

- USDC payments via Locus
- Secure session-based checkout
- Download link delivery on success

## Tech Stack

- Next.js 16
- React 19
- Clerk Authentication
- Supabase (PostgreSQL)
- OpenRouter (AI)
- Locus Checkout

## Quick Start

```bash
bun install
cp .env.example .env.local
bun run dev
```

Open `http://localhost:3000`.

## Product Form

When creating a product, provide:

- Product name
- Description (what it does)
- Target audience
- Key features
- Pricing preference (free, paid, name-your-price)

AI generates:

- Marketing headline
- Feature copy
- Pricing recommendation
- Full content guide

## Environment

Use `.env.local` for local development.

Public browser-safe values:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_LOCUS_PUBLIC_KEY`

Server-only values:

- `CLERK_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENROUTER_API_KEY`
- `LOCUS_SECRET_KEY`

An example template is included in [.env.example](./.env.example).

## API Endpoints

- `POST /api/products` - Create product
- `GET /api/products` - List user products
- `GET /api/products/[id]` - Get product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product
- `POST /api/generate-ai-content` - Generate AI content
- `GET /api/checkout/[sessionId]` - Get checkout session

## Project Structure

```text
app/
├── (public)/
│   ├── page.tsx
│   ├── sign-in/
│   └── [[...rest]]/
├── dashboard/
│   └── page.tsx
├── product/
│   └── [id]/
└── api/
    ├── products/
    ├── generate-ai-content/
    └── checkout/
components/
├── ProductBuilder.tsx
├── ProductCard.tsx
├── LandingPage.tsx
├── SuccessDisplay.tsx
lib/
├── supabase.ts
prisma/
└── schema.prisma
```

Key files:

- `app/(public)/page.tsx` - Landing page
- `app/dashboard/page.tsx` - User dashboard
- `app/product/[id]/page.tsx` - Public sales page
- `components/ProductBuilder.tsx` - Product creation form
- `components/SuccessDisplay.tsx` - Buyer success/delivery
- `prisma/schema.prisma` - Database schema

## License

MIT