# Grand Plaza — Hotel Management System (HMS)

**Module:** UFCF8S-30-2 Advanced Software Development  
**Institution:** University of the West of England (UWE)  
**Stack:** .NET 10 · Angular 21 · PostgreSQL 18.3 · Docker

---

## Overview

Grand Plaza HMS is a full-stack hotel management solution covering the complete guest lifecycle — from room discovery and booking through check-in, billing, and performance reporting. It supports four distinct user roles across multiple properties.

| Role | Capabilities |
|------|-------------|
| **Guest** | Search rooms, book stays, manage profile, view invoices |
| **Front Desk Staff** | Check-in/out, walk-in bookings, room status board, ancillary services |
| **Hotel Manager** | Occupancy, revenue, and staff performance reports |
| **Admin** | User management, hotel config, room pricing, audit logs |

---

## Architecture

Clean Architecture (4 layers):

```
backend/
├── HMS.Domain/          # Entities, enums, repository interfaces
├── HMS.Application/     # Services, DTOs, business rule policies
├── HMS.Infrastructure/  # EF Core DbContext, PostgreSQL repositories, migrations
└── HMS.API/             # REST controllers, middleware, DI wiring

frontend/
└── src/app/
    ├── core/            # Auth, guards, interceptors, models, services
    ├── features/        # 8 lazy-loaded modules (auth, guest, bookings, billing,
    │                    #   staff, manager, admin, rooms)
    ├── shared/          # Reusable components and pipes
    └── pages/           # Landing, contact, 404
```

---

## Getting Started

### Option A — Full stack via Docker (recommended)

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
docker-compose up -d
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| Swagger UI | http://localhost:5101/swagger |
| pgAdmin | http://localhost:5050 |
| PostgreSQL | localhost:5433 |

The backend automatically applies migrations and seeds demo data on first run.

To stop and remove all containers:
```bash
docker-compose down
```

To rebuild images after code changes:
```bash
docker-compose build --no-cache
docker-compose up -d
```

---

### Option B — Local development

**Prerequisites:**
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js v22+](https://nodejs.org/)
- [Angular CLI](https://angular.dev/tools/cli)
- PostgreSQL running locally (or start just the DB via Docker: `docker-compose up -d postgres`)

**Backend:**
```bash
cd backend
dotnet restore
cd HMS.API
dotnet run
```
Swagger: http://localhost:5001/swagger

**Frontend:**
```bash
cd frontend
npm install
ng serve
```
App: http://localhost:4200

---

## Default Test Accounts

| Role | Email | Password | Name |
|------|-------|----------|------|
| Admin | admin@grandplaza.com | Admin@1234! | Admin User |
| Manager | manager@grandplaza.com | Manager@1234! | Aishath Latheef |
| Staff | staff@grandplaza.com | Staff@1234! | Mohamed Shifan |
| Guest | guest@example.com | Guest@1234! | Grace Taylor |

---

## Key Features

- **Booking wizard** — 4-step flow with real-time availability calendar and room capacity validation
- **Walk-in booking** — 3-step flow for front desk staff
- **Check-in / Check-out** — Payment pre-auth on check-in, capture on check-out
- **Ancillary services** — Spa, airport transfer, breakfast, late checkout added per booking
- **Invoicing** — Itemised invoices with VAT breakdown
- **Password reset** — Token-based recovery (1-hour expiry)
- **Account security** — BCrypt hashing, 5-attempt lockout (15-min cooldown), inactivity auto-logout (15 min)
- **Audit trail** — All login, booking, check-in/out, and admin actions logged
- **Reports** — Occupancy, revenue, and staff performance analytics
- **Multi-property** — Hotel selector with per-property configuration

---

## Testing

```bash
# Backend unit tests (from /backend)
dotnet test

# Frontend unit tests (from /frontend)
ng test
```

Test coverage: cancellation policy, password policy, pricing policy, auth service, booking management service.

---

## Documentation

UML diagrams (Use Case, Class, Sequence) are in `docs/diagrams/` as PlantUML `.puml` files.

---

## Authors

- **Student Name:** [Your Name]
- **Student ID:** [Your Student ID]
- **Module:** UFCF8S-30-2 Advanced Software Development
