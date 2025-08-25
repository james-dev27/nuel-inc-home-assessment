# SupplySight Dashboard - Full Stack Application

A complete supply chain inventory management system with React frontend and GraphQL backend.

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS + Apollo Client
- **Backend**: Node.js + GraphQL + Apollo Server Express
- **Data**: In-memory store with sample inventory data

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development servers**:
   ```bash
   # Option 1: Run both frontend and backend concurrently
   npm run dev
   
   # Option 2: Run separately in different terminals
   # Terminal 1 - Backend (GraphQL API on port 4000)
   cd server && npx tsx watch index.ts
   
   # Terminal 2 - Frontend (React app on port 8080)
   npm run dev:client
   ```

3. **Access the application**:
   - Frontend: http://localhost:8080
   - GraphQL Playground: http://localhost:4000/graphql

## Project Structure

```
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── graphql/           # GraphQL queries/mutations
│   ├── lib/               # Apollo client setup
│   └── pages/             # Route components
├── server/                # GraphQL backend
│   ├── index.ts          # Server entry point
│   ├── schema.ts         # GraphQL schema
│   ├── resolvers.ts      # GraphQL resolvers
│   └── data.ts           # Sample data
└── NOTES.md              # Technical decisions & trade-offs
```

## Features

### Dashboard
- Real-time KPI tracking (Stock, Demand, Fill Rate)
- Interactive line charts for trends
- Date range filtering (7d, 14d, 30d)

### Inventory Management
- Product search and filtering
- Warehouse-based filtering
- Status-based filtering (Healthy/Low/Critical)
- Pagination support

### Product Operations
- Update demand forecasts
- Transfer stock between warehouses
- Real-time status updates

## GraphQL API

The backend provides a full GraphQL API with:

### Queries
- `products(search, status, warehouse)` - Get filtered products
- `warehouses` - Get all warehouse locations
- `kpis(range)` - Get KPI data for time range

### Mutations
- `updateDemand(id, demand)` - Update product demand
- `transferStock(id, from, to, qty)` - Transfer stock between warehouses

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Apollo Client
- **Backend**: Node.js, GraphQL, Apollo Server Express
- **Build**: Vite, TSX
- **Development**: Concurrently for running both servers

## Development Notes

See [NOTES.md](./NOTES.md) for detailed technical decisions, trade-offs, and future improvements.