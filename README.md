# Gorath Artist Portfolio & Commission Website

A modern, responsive website for digital artist Gorath, featuring a portfolio gallery, commission system, and social media feed integration.

## Features

- **Responsive Design**: Looks great on all devices from mobile to desktop
- **Portfolio Gallery**: Showcase artwork with filtering and search capabilities
- **Commission System**: Detailed commission tiers and request form
- **Social Media Feed**: Aggregated feed from multiple platforms (Twitter, Instagram, DeviantArt, Tumblr)
- **Newsletter Subscription**: Mailchimp integration for staying in touch with fans
- **Admin Dashboard**: Manage commissions and subscribers
- **Database Integration**: Track commission status and subscriber information

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Prisma ORM on PostgreSQL (Supabase)
- **Authentication**: NextAuth.js
- **Payment Processing**: Stripe
- **Email Marketing**: Mailchimp

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/gorsite.git
cd gorsite
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Copy the example env file and modify as needed
cp .env.example .env
```

4. Configure Supabase (Postgres)

Create a Supabase project, then:

- Copy the Project URL and anon key into `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Copy your database Connection Pooling URL into `DATABASE_URL` and your Direct connection URL into `DIRECT_URL`.

Example `.env` entries (replace placeholders):

```
NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>
DATABASE_URL="postgresql://postgres:<PASSWORD>@db.<PROJECT>.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:<PASSWORD>@db.<PROJECT>.supabase.co:5432/postgres"
```

5. Initialize the database schema on Supabase
```bash
npx prisma migrate deploy
```

6. Create an admin user (optional)
```bash
node scripts/create-admin.js
```

5. Run the development server
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

### Notes on Prisma + Supabase

- Prisma connects via `DATABASE_URL` (pooled). Migrations use `DIRECT_URL`.
- Existing models are compatible with Postgres. If you were previously on SQLite, data will not auto-migrate; seed or import as needed.

## Branding

- Default studio name comes from `src/config/brand.ts` and is set to `DayAndNightProductions`.
- To style the site around a big artist‑drawn hero, place your hero image at `public/branding/dayandnight-hero.png`. A placeholder lives at `public/placeholder-hero.svg`.
- The default accent color is keyed to the hero art (neon green/cyan). You can switch the accent in the UI or modify the default in `src/context/ThemeContext.tsx`.

## Deployment

This project can be easily deployed to Vercel:

```bash
npm install -g vercel
vercel
```

## Scripts

- `npm run dev`: Starts the Next.js dev server.
- `npm run build`: Generates Prisma client and builds the Next.js app.
- `npm run start`: Starts the production server after a build.
- `npm run lint`: Runs Next.js/ESLint checks.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Design inspiration from [Gorath's original Carrd site](https://gorath.carrd.co/)
- Icons from [React Icons](https://react-icons.github.io/react-icons/)
- UI components styled with [TailwindCSS](https://tailwindcss.com/)
