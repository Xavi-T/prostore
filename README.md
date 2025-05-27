# Prostore

Prostore is a simple and modern e-commerce platform built with Next.js, Prisma, and PostgreSQL. It features user authentication, product management, cart and order processing, and payment integration.

## Features

- User authentication (NextAuth.js)
- Product listing, search, and filtering
- Shopping cart and order management
- Payment methods: PayPal, Stripe, Cash on Delivery
- Admin dashboard for managing products, orders, and users
- Review system for products
- Responsive and modern UI

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Next.js API routes, Prisma ORM
- **Database:** PostgreSQL (Neon)
- **Authentication:** NextAuth.js
- **Payments:** PayPal, Stripe

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- PostgreSQL database (Neon or local)

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repo-url>
   cd prostore
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   - Copy `.env.example` to `.env` and fill in the required values (see `.env` for reference).

4. **Set up the database:**

   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

- `app/` - Next.js app directory (pages, layouts, API routes)
- `components/` - Reusable React components
- `db/` - Prisma client and seed scripts
- `lib/` - Utility functions and helpers
- `prisma/` - Prisma schema and migrations
- `public/` - Static assets
- `types/` - TypeScript type definitions

## Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run start` - Start the production server
- `npx prisma studio` - Open Prisma Studio (DB GUI)
- `npx prisma migrate dev` - Run database migrations

## License

This project is for educational purposes. See [Udemy course by Brad Traversy](https://www.udemy.com/course/nextjs-dev-to-deployment/) for more details.

[github-repo](https://github.com/bradtraversy/prostore)
