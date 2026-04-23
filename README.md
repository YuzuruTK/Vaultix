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

### Type Checking
```bash
npm run typecheck
```
Validates TypeScript types.

## Deployment

### Cloudflare Pages (Recommended)

Deploy to Cloudflare Pages for free global hosting:

1. **Connect Your Repository**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Create a new Pages project
   - Connect your Git repository

2. **Configure Build Settings**:
   - Build command: `npm run build`
   - Build output directory: `build/client`

3. **Deploy**:
   - Your app will be live at `yourproject.pages.dev`
   - Automatic deployments on every push to main branch

For detailed setup instructions, see [PAGES_DEPLOYMENT.md](./PAGES_DEPLOYMENT.md)

### Local Pages Testing

To test Pages locally before deploying:

```bash
npm run build
npx wrangler pages dev ./build/client
```

This starts a local development server that mimics Cloudflare Pages.

## Project Structure

```
app/
  components/        # React components (MetricCard, Toast)
  lib/              # Utilities (CSV parsing, formatting)
  routes/           # Page routes (Entradas, Saídas, Index)
  entry.client.tsx  # Client entry point
  entry.server.tsx  # Server entry point
  root.tsx          # Root layout component
  app.css          # Styles
```

## Usage

1. Navigate to the **Entradas** tab to record incoming transactions
2. Navigate to the **Saídas** tab to record expenses
3. Use filters to view transactions by month and category
4. Export/import CSV files for backup or data management

---

Built with [Remix](https://remix.run/) and [React](https://react.dev/)
