# 🏸 Sports Facility Booking Platform – Backend

This is the backend service for the **Sports Facility Booking Platform**.

It exposes REST APIs to:

- Manage **courts, equipment, coaches, pricing rules, coach availability**
- Check **availability** of resources for a given time slot
- Create **bookings** with dynamic pricing

Built with:

- **Node.js + Express**
- **PostgreSQL** (via `pg` client)
- SQL schemas in `schema.sql` and dummy data in `seed.sql`

---

## 📦 Tech Stack

- **Runtime:** Node.js (v18+ recommended)
- **Framework:** Express
- **Database:** PostgreSQL
- **ORM/Client:** `pg` (raw SQL)

---

## ⚙️ Setup Instructions

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd badminton-booking-platform/backend


npm install
# or
yarn install


PORT=8080

DATABASE_URL="not disclosing"

DATABASE SETUP 

psql -U postgres
CREATE DATABASE badminton_db;
\q

APPLY SCHEMA 

psql -U postgres -d badminton_db -f ./src/config/schema.sql

SEED DUMMY SCHEMA 

psql -U postgres -d badminton_db -f ./src/config/seed.sql


1️⃣ GET /api/availability

Check availability of courts, equipment, and coaches for a given time range.

🔹 Query Parameters

startTime (string, required) – "YYYY-MM-DD HH:mm:ss"

endTime (string, required) – "YYYY-MM-DD HH:mm:ss"

📚 API Endpoints
1️⃣ GET /api/availability

Purpose:
Check availability of courts, equipment, and coaches for a given time range.

Query params:

startTime (required) – YYYY-MM-DD HH:mm:ss

endTime (required) – YYYY-MM-DD HH:mm:ss

What it does:

Returns all courts with an available / booked status in that time range.

Returns all equipment with remaining available quantity.

Returns all coaches with available / unavailable status based on:

their defined availability slots

existing overlapping bookings

Test cases:

✅ Valid startTime & endTime → should return courts, equipment, coaches list.

❌ Missing query param → should return validation error.

❌ Invalid date format → should return error.

2️⃣ POST /api/bookings

Purpose:
Create a new booking (court + optional equipment + optional coach) and calculate total price using pricing rules.

Request body:

userName (string, required)

userEmail (string, required)

startTime (string, required – YYYY-MM-DD HH:mm:ss)

endTime (string, required – YYYY-MM-DD HH:mm:ss)

courtId (number, required)

equipment (optional array)

equipmentTypeId (number)

quantity (number)

coachId (optional number)

What it does:

Validates:

time range (startTime < endTime)

court availability (no overlapping CONFIRMED bookings)

equipment stock for selected quantities

coach availability and working hours (if coachId provided)

Calculates:

base court cost

base equipment cost

base coach cost

applies all matching pricing_rules (MULTIPLIER / FLAT)

final total price

Persists:

new row in bookings

rows in booking_equipments (if any equipment)

row in booking_coaches (if coach selected)

Test cases:

✅ Valid data, available court → booking created, price calculated.

❌ Overlapping booking for the same court → conflict/error.

❌ Equipment quantity exceeds available stock → error.

❌ Invalid time range (startTime >= endTime) → error.

❌ Missing required fields → error.

3️⃣ POST /api/admin/courts

Purpose:
Create a new court.

Request body:

name (string, required)

isIndoor (boolean, required)

baseHourlyRate (number, required)

isActive (boolean, optional – defaults to true in DB)

What it does:

Inserts a new court into the courts table with the provided properties.

Test cases:

✅ All fields valid → new court is created.

❌ Missing name or baseHourlyRate → error.

❌ Invalid types (e.g. string for baseHourlyRate) → error.

4️⃣ POST /api/admin/equipment

Purpose:
Create a new equipment type.

Request body:

name (string, required)

totalQuantity (number, required)

pricePerUnit (number, required)

isActive (boolean, optional – defaults to true)

What it does:

Inserts a new row into the equipment_types table.

Test cases:

✅ Valid equipment data → equipment created.

❌ Missing any required field → error.

5️⃣ POST /api/admin/coaches

Purpose:
Create a new coach.

Request body:

name (string, required)

bio (string, optional)

hourlyRate (number, required)

isActive (boolean, optional – defaults to true)

What it does:

Inserts a new row into the coaches table.

Test cases:

✅ Valid data → coach created.

❌ Missing name or hourlyRate → error.

6️⃣ POST /api/admin/pricing-rules

Purpose:
Create a pricing rule used for dynamic pricing.

Request body:

name (string, required)

appliesTo (string enum, required) – one of:

"COURT" | "EQUIPMENT" | "COACH" | "OVERALL"

ruleType (string enum, required) – "MULTIPLIER" or "FLAT"

value (number, required)

isWeekend (boolean or null, optional)

startHour (number or null, optional, 0–23)

endHour (number or null, optional, 0–23)

indoorOnly (boolean or null, optional)

isActive (boolean, optional – defaults to true)

What it does:

Inserts a new row into pricing_rules.

These rules are later applied when calculating booking price based on:

what it applies to (court/equipment/coach/overall),

whether it’s weekend-only or weekday-only,

specific hours in the day,

indoor-only constraints.

Test cases:

✅ Valid rule with minimum required fields → rule created.

✅ Rule using filters (isWeekend, startHour, indoorOnly) → stored correctly.

❌ Missing name or value → error.

❌ Invalid enum for appliesTo or ruleType → error.

7️⃣ POST /api/admin/coaches/:coachId/availability

Purpose:
Define availability slots for a coach.

URL params:

coachId (required) – ID of existing coach.

Request body:

dayOfWeek (number, required) – 0–6 (Sun–Sat)

startHour (number, required) – 0–23

endHour (number, required) – 0–23

What it does:

Inserts a new row into the coach_availabilities table.

Availability is later used to compute whether a coach is free in /api/availability and /api/bookings.

Test cases:

✅ Valid coach ID & time slot → availability row created.

❌ Non-existing coachId → error (coach not found).

❌ startHour >= endHour → error.

🧪 Manual Testing Tips

Use Postman / Thunder Client / Insomnia.

Set Base URL to http://localhost:8080/api.

Test in order:

GET /availability

POST /bookings

Admin routes:

POST /admin/courts

POST /admin/equipment

POST /admin/coaches

POST /admin/pricing-rules

POST /admin/coaches/:coachId/availability

Use IDs from the seeded data for courts, equipment, and coaches.

✅ High-Level Flow

Admin configures:

courts, equipment, coaches

pricing rules

coach availability

User:

checks availability (GET /api/availability)

creates bookings (POST /api/bookings)

Backend:

enforces conflict checks for time & resources

applies dynamic pricing with rules

stores detailed booking + price breakdown in