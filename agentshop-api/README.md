# AgentShop API

A **domain-neutral demo backend** that simulates a real business system with orders, shipping, inventory, returns, policies, tickets, and knowledge base. Built for VorteeGo demo to orchestrate multi-agent workflows.

## Features

- **Order Management**: Track customer orders from placement to delivery
- **Shipping & Tracking**: Real-time shipment tracking with carrier events
- **Inventory Management**: Reserve and release inventory with atomicity guarantees
- **Returns Processing**: Handle return requests, approvals, and refunds
- **Support Tickets**: Create and manage support tickets across departments
- **Policy Engine**: Country-specific refund and replacement policies
- **Knowledge Base**: Searchable documentation with full-text search
- **Observability**: Structured logging, request ID tracking, and metrics

## Tech Stack

- **Runtime**: Node.js 22
- **Framework**: Fastify (latest stable)
- **ORM**: Prisma (latest stable)
- **Database**: PostgreSQL 15+
- **Language**: TypeScript (strict mode)
- **Logging**: Pino (Fastify default)
- **Containerization**: Docker + Docker Compose

## Prerequisites

- Node.js 22
- Docker and Docker Compose (for containerized setup)
- PostgreSQL 15+ (for local development without Docker)

## Quick Start with Docker Compose

The fastest way to get started is using Docker Compose:

```bash
# Clone the repository
cd agentshop-api

# Start all services (database + API)
docker-compose up --build

# The API will be available at http://localhost:8080
# Database migrations and seeding happen automatically
```

The API will:
1. Wait for PostgreSQL to be healthy
2. Run database migrations
3. Seed the database with demo data
4. Start the API server on port 8080

## Manual Setup

### 1. Install Dependencies

```bash
cd agentshop-api
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database credentials
```

Environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `API_KEY`: API key for authentication (default: `demo-key`)
- `PORT`: Server port (default: `8080`)
- `NODE_ENV`: Environment (development/production)

### 3. Setup Database

```bash
# Run migrations
npm run db:migrate

# Seed database with demo data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:8080`.

## API Documentation

All endpoints require authentication via `Authorization: Bearer <API_KEY>` header (except `/health` and `/metrics`).

All responses include `X-Request-Id` header for request tracking.

### Authentication

**Header**: `Authorization: Bearer demo-key`

**Response Codes**:
- `401` - Missing or invalid authorization header

### Health Check

**GET** `/health`

No authentication required.

```json
{
  "status": "ok",
  "timestamp": "2025-01-16T10:00:00Z"
}
```

### Customers

**GET** `/customers?email=...`

Find customer by email.

**GET** `/customers/:id`

Get customer by ID.

### Orders

**GET** `/orders/:id`

Get order with items, customer, notes, shipments, and returns.

**GET** `/orders?customer_email=...`

List all orders for a customer.

**POST** `/orders/:id/notes`

Add a note to an order.

```json
{
  "note": "Customer called about delivery",
  "visibility": "internal"
}
```

### Shipping

**GET** `/shipments/by-tracking/:tracking_id`

Track shipment by tracking ID. Returns shipment with events and order details.

**GET** `/shipments/by-order/:order_id`

Get all shipments for an order.

**POST** `/shipments/:id/simulate`

Demo endpoint to simulate status transitions.

```json
{
  "status": "delayed",
  "message": "Weather delays in the region",
  "location": "Regional Hub"
}
```

Valid statuses: `label_created`, `in_transit`, `delayed`, `out_for_delivery`, `delivered`, `exception`

### Inventory

**GET** `/inventory/:sku`

Get inventory status including active reservations.

**POST** `/inventory/reserve`

Reserve inventory (atomic operation).

```json
{
  "sku": "LAPTOP-X1",
  "qty": 1,
  "reason": "replacement"
}
```

**POST** `/inventory/release`

Release a reservation (atomic operation).

```json
{
  "reservation_id": "uuid"
}
```

### Returns

**POST** `/returns`

Create a return request.

```json
{
  "order_id": "uuid",
  "reason_code": "wrong_item",
  "details": "Received headphones instead of phone"
}
```

Reason codes: `wrong_item`, `damaged`, `late`, `changed_mind`

**POST** `/returns/:id/approve`

Approve a return request.

**POST** `/returns/:id/receive`

Mark return as received.

**POST** `/returns/:id/refund`

Issue refund (requires `approved` or `received` status).

### Tickets

**POST** `/tickets`

Create a support ticket.

```json
{
  "type": "warehouse",
  "priority": "high",
  "title": "Inventory discrepancy",
  "body": "SKU count mismatch needs investigation"
}
```

Types: `warehouse`, `carrier`, `billing`, `support`
Priorities: `low`, `med`, `high`

**GET** `/tickets/:id`

Get ticket by ID.

### Policies & Knowledge Base

**GET** `/policies?country=HR`

Get policy for a country code.

**GET** `/kb/search?q=delayed`

Search knowledge base documents.

### Demo Helpers

**POST** `/demo/reset`

Reset database to seed state (re-runs seed script).

### Metrics

**GET** `/metrics`

Get system metrics.

```json
{
  "uptime_seconds": 12345,
  "requests_total": 5000,
  "memory_usage_mb": 128,
  "timestamp": "2025-01-16T10:00:00Z"
}
```

## Demo Scenarios

The seed data includes 99+ orders covering these scenarios:

### 1. WISMO Delayed (15 orders)
Shipments with `delayed` status and various delay reasons.

### 2. Wrong Item (12 orders)
Delivered orders where customer may have received wrong item.

### 3. Out of Stock Replacement (12 orders)
Orders with items that are currently out of stock (SKU: HEADSET-Z3).

### 4. Refund Outside Window (12 orders)
Orders delivered 31-60 days ago, outside standard 30-day refund window.

### 5. VIP Customer Exception (12 orders)
VIP customers who may request policy exceptions.

### 6. Carrier Exception (12 orders)
Shipments with carrier exceptions (address issues, customs holds, etc.).

### 7. Split Shipment (12 orders)
Orders with multiple shipments in different states.

### 8. Internal Note Redaction (12 orders)
Orders with internal notes that shouldn't be exposed to customers.

## Database Schema

### Core Entities

- **customers**: Customer information with country and tags
- **orders**: Order lifecycle from placement to delivery
- **order_items**: Line items for each order
- **order_notes**: Internal and public notes on orders
- **shipments**: Shipment tracking with carrier information
- **shipment_events**: Timeline of shipment status changes
- **inventory**: Product SKUs with available and reserved quantities
- **inventory_reservations**: Active inventory reservations
- **returns**: Return requests and processing
- **tickets**: Support tickets across departments
- **policies**: Country-specific refund/replacement policies
- **kb_docs**: Knowledge base articles

## Error Handling

All errors return consistent JSON format:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Order not found"
  }
}
```

Status codes: `400` (Bad Request), `401` (Unauthorized), `404` (Not Found), `500` (Internal Error)

## Logging

Structured JSON logs with Pino include:
- Request ID (from header or auto-generated)
- HTTP method, URL, status code
- Response time
- Error stack traces (in development)

## Development

```bash
# Install dependencies
npm install

# Run in watch mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database commands
npm run db:migrate   # Run migrations
npm run db:seed      # Seed data
npm run db:reset     # Reset and reseed
```

## Docker Commands

```bash
# Build and start
docker compose up --build

# Stop services
docker compose down

# View logs
docker compose logs -f api

# Reset database (from container)
docker compose exec api npx tsx prisma/seed.ts
```

## Example API Calls

```bash
# Health check (no auth)
curl http://localhost:8080/health

# Get customer by email
curl -H "Authorization: Bearer demo-key" \
  "http://localhost:8080/customers?email=ivan.horvat@example.hr"

# Track shipment
curl -H "Authorization: Bearer demo-key" \
  "http://localhost:8080/shipments/by-tracking/DELAYED001"

# Create return request
curl -X POST http://localhost:8080/returns \
  -H "Authorization: Bearer demo-key" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "uuid-here",
    "reason_code": "wrong_item",
    "details": "Received wrong color"
  }'

# Search knowledge base
curl -H "Authorization: Bearer demo-key" \
  "http://localhost:8080/kb/search?q=delayed"
```
