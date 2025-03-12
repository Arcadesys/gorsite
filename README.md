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
- **Database**: Prisma ORM with SQLite (can be upgraded to PostgreSQL)
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

4. Initialize the database
```bash
npx prisma migrate dev
```

5. Run the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This project can be easily deployed to Vercel:

```bash
npm install -g vercel
vercel
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Design inspiration from [Gorath's original Carrd site](https://gorath.carrd.co/)
- Icons from [React Icons](https://react-icons.github.io/react-icons/)
- UI components styled with [TailwindCSS](https://tailwindcss.com/)
