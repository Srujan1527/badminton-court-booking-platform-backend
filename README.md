# Sports Facility Booking Platform � Backend

Reliable REST API for managing courts, equipment, coaches, and dynamic pricing for badminton facilities.

---

## Highlights
- Unified API for availability checks, bookings, and admin management
- Dynamic pricing via flexible multiplier / flat rules
- Raw SQL on PostgreSQL for predictable performance
- Seed + schema scripts for reproducible local environments

## Tech Stack
- Node.js 18+
- Express
- PostgreSQL + pg client

## Prerequisites
- Node.js 18 or newer
- PostgreSQL 14+
- psql CLI available in PATH

## Setup
```bash
# clone and install
 git clone <your-repo-url>
 cd badminton-booking-platform/backend
 npm install
```

### Environment variables
Create a `.env` (or export) with:
```bash
PORT=8080
DATABASE_URL=postgres://<user>:<pass>@localhost:5432/badminton_db
```

### Database
```bash
psql -U postgres -c "CREATE DATABASE badminton_db;"
psql -U postgres -d badminton_db -f ./src/config/schema.sql
psql -U postgres -d badminton_db -f ./src/config/seed.sql
```

### Start the server
```bash
npm run dev
# or
npm start
```
Default base URL: `http://localhost:8080/api`.

## REST API Overview
| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/availability` | GET | Courts/equipment/coaches availability for a time range |
| `/bookings` | POST | Create booking, validates conflicts, applies pricing rules |
| `/admin/courts` | POST | Add courts (indoor/outdoor, pricing, status) |
| `/admin/equipment` | POST | Add rentable equipment types |
| `/admin/coaches` | POST | Create coaches with hourly rates |
| `/admin/pricing-rules` | POST | Configure dynamic pricing rules |
| `/admin/coaches/:coachId/availability` | POST | Define coach availability slots |

## Usage Notes
- Availability queries require `startTime` & `endTime` in `YYYY-MM-DD HH:mm:ss` format.
- Booking payload validates time ranges, court conflicts, equipment stock, coach schedules, and computes totals.
- Admin routes expect authenticated access layer (add middleware as needed).

## Manual Testing Tips
1. Use Postman/Thunder Client with the API base URL above.
2. Hit `/availability` first to pick available resources.
3. Create bookings, then experiment with pricing rules and availability windows.
4. Use seeded IDs for a quick start (see `src/config/seed.sql`).


