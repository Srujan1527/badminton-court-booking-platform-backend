CREATE TYPE booking_status AS ENUM ('CONFIRMED', 'CANCELLED', 'WAITLIST');

CREATE TABLE
    courts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        is_indoor BOOLEAN NOT NULL,
        base_hourly_rate NUMERIC(10, 2) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE
    );

CREATE TABLE
    equipment_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        total_quantity INT NOT NULL,
        price_per_unit NUMERIC(10, 2) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE
    );

CREATE TABLE
    coaches (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        bio TEXT,
        hourly_rate NUMERIC(10, 2) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE
    );

CREATE TABLE
    coach_availabilities (
        id SERIAL PRIMARY KEY,
        coach_id INT NOT NULL REFERENCES coaches (id) ON DELETE CASCADE,
        day_of_week INT NOT NULL, -- 0-6 (Sun-Sat)
        start_hour INT NOT NULL, -- 24h  e.g. 18 => 6PM
        end_hour INT NOT NULL
    );

CREATE TABLE
    bookings (
        id SERIAL PRIMARY KEY,
        user_name VARCHAR(100) NOT NULL,
        user_email VARCHAR(100) NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        court_id INT NOT NULL REFERENCES courts (id),
        total_price NUMERIC(10, 2) NOT NULL,
        status booking_status NOT NULL DEFAULT 'CONFIRMED',
        created_at TIMESTAMP NOT NULL DEFAULT NOW (),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW ()
    );

CREATE TYPE rule_target AS ENUM ('COURT', 'EQUIPMENT', 'COACH', 'OVERALL');

CREATE TYPE rule_type AS ENUM ('MULTIPLIER', 'FLAT');

CREATE TABLE
    pricing_rules (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        applies_to rule_target NOT NULL,
        is_weekend BOOLEAN,
        start_hour INT,
        end_hour INT,
        indoor_only BOOLEAN,
        rule_type rule_type NOT NULL,
        value NUMERIC(10, 2) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE
    );

CREATE TABLE
    booking_equipments (
        id SERIAL PRIMARY KEY,
        booking_id INT NOT NULL REFERENCES bookings (id) ON DELETE CASCADE,
        equipment_type_id INT NOT NULL REFERENCES equipment_types (id),
        quantity INT NOT NULL,
        price NUMERIC(10, 2) NOT NULL
    );

CREATE TABLE
    booking_coaches (
        id SERIAL PRIMARY KEY,
        booking_id INT NOT NULL REFERENCES bookings (id) ON DELETE CASCADE,
        coach_id INT NOT NULL REFERENCES coaches (id),
        price NUMERIC(10, 2) NOT NULL
    );