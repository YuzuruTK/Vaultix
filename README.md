# Vaultix

Track income, manage expenses, and analyze your financial data in one place.

## About

Vaultix helps you track and analyze incoming and outgoing transactions. Monitor your finances with categorized entries, payment methods, and comprehensive analytics.

### Features

- **Entradas (Income)**: Track sales, services, recurring income, and other sources
- **Saídas (Expenses)**: Manage supplier costs, payroll, taxes, infrastructure, marketing, and other expenses
- **Analytics**: View metrics like total amount, monthly average, ticket average, and highest transaction
- **Filtering**: Filter transactions by month and category
- **CSV Import/Export**: Import and export transaction data
- **Payment Methods**: Support for multiple payment methods (Cash, PIX, Debit Card, Credit Card, Bank Transfer, Boleto)

## Requirements

- Node.js 18.0.0 or higher
- npm (or yarn/pnpm)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

## Running

### Development Mode
```bash
npm run dev
```
Starts the development server. Open http://localhost:5173 in your browser.

### Production Build
```bash
npm run build
```
Creates an optimized production build in the `build/` directory.

### Run With Cloudflare Pages Runtime
```bash
npm start
```
Runs the app using `wrangler pages dev`.

### Deploy to Cloudflare Pages
```bash
npx wrangler pages deploy ./build/client
```
Deploys the built client output and functions.

### Type Checking
```bash
npm run typecheck
```
Validates TypeScript types.

## Project Structure

```
app/
  components/        # React components (MetricCard, Toast)
  lib/              # Utilities (CSV parsing, formatting)
  routes/           # Page routes (Entradas, Saídas, Index)
  entry.client.tsx  # Client entry point
  entry.server.tsx  # Cloudflare-compatible server entry point
  root.tsx          # Root layout component
  app.css          # Styles
functions/
  [[path]].ts      # Cloudflare Pages function entry
server.ts          # Pages handler bootstrap
wrangler.toml      # Cloudflare Pages config
```

## Usage

1. Navigate to the **Entradas** tab to record incoming transactions
2. Navigate to the **Saídas** tab to record expenses
3. Use filters to view transactions by month and category
4. Export/import CSV files for backup or data management

---

Built with [Remix](https://remix.run/) and [React](https://react.dev/)
