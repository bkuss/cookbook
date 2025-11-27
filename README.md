# Familienrezepte

A mobile-first German recipe management app for personal/family use.

> **Note:** This is a personal project, built with AI assistance, intended for self-deployment.

## Tech Stack

- Next.js 16 (App Router)
- PostgreSQL (raw SQL, no ORM)
- Tailwind CSS + shadcn/ui
- JWT authentication with shared PIN

## Features

- Recipe management with ingredients and instructions
- AI-powered recipe import from images/URLs
- AI image generation for recipes
- Adjustable servings with ingredient scaling

## Setup

```bash
npm install
npm run dev
```

## Environment Variables

```
DATABASE_URI=postgresql://...
REPLICATE_API_TOKEN=...
```

## Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # Run ESLint
```
