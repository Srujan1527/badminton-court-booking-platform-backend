-- seed.sql
-- Dummy data for badminton_db
-- Run this AFTER running schema.sql
BEGIN;

-- 1️⃣ Clean existing data (optional but recommended for dev)
TRUNCATE TABLE booking_coaches,
booking_equipments,
pricing_rules,
coach_availabilities,
bookings,
coaches,
equipment_types,
courts RESTART IDENTITY CASCADE;

-- 2️⃣ courts
INSERT INTO
    courts (name, is_indoor, base_hourly_rate, is_active)
VALUES
    ('Court A1', TRUE, 300.00, TRUE),
    ('Court A2', TRUE, 280.00, TRUE),
    ('Court B1', FALSE, 200.00, TRUE),
    ('Court B2', FALSE, 180.00, TRUE),
    ('VIP Indoor Court', TRUE, 500.00, TRUE);

-- 3️⃣ equipment_types
INSERT INTO
    equipment_types (name, total_quantity, price_per_unit, is_active)
VALUES
    ('Badminton Racket', 20, 50.00, TRUE),
    ('Shuttlecock', 200, 5.00, TRUE),
    ('Wrist Band', 40, 20.00, TRUE),
    ('Knee Support', 25, 30.00, TRUE),
    ('Sports Shoes', 15, 100.00, TRUE);

-- 4️⃣ coaches
INSERT INTO
    coaches (name, bio, hourly_rate, is_active)
VALUES
    (
        'Arjun Kumar',
        'National-level badminton player with 10 years coaching experience.',
        400.00,
        TRUE
    ),
    (
        'Rohit Sharma',
        'Former state champion specializing in beginners and children.',
        300.00,
        TRUE
    ),
    (
        'Sanjana Rao',
        'Expert in professional footwork and advanced techniques.',
        450.00,
        TRUE
    ),
    (
        'Meera K',
        'Fitness & agility specialist with badminton focus.',
        350.00,
        TRUE
    ),
    (
        'Rahul Varma',
        'Coaching for competitive tournaments and strategy sessions.',
        500.00,
        TRUE
    );

-- 5️⃣ bookings
INSERT INTO
    bookings (
        user_name,
        user_email,
        start_time,
        end_time,
        court_id,
        total_price,
        status
    )
VALUES
    (
        'Srujan',
        'srujan@example.com',
        '2025-01-10 10:00:00',
        '2025-01-10 12:00:00',
        1,
        600.00,
        'CONFIRMED'
    ),
    (
        'Amit Kumar',
        'amit@example.com',
        '2025-01-11 09:00:00',
        '2025-01-11 11:00:00',
        2,
        560.00,
        'CONFIRMED'
    ),
    (
        'Neha Verma',
        'neha@example.com',
        '2025-01-12 17:00:00',
        '2025-01-12 18:00:00',
        3,
        200.00,
        'CANCELLED'
    ),
    (
        'John Paul',
        'john@example.com',
        '2025-01-13 15:00:00',
        '2025-01-13 17:00:00',
        4,
        360.00,
        'CONFIRMED'
    ),
    (
        'Megha R',
        'megha@example.com',
        '2025-01-14 08:00:00',
        '2025-01-14 10:00:00',
        5,
        1000.00,
        'WAITLIST'
    );

-- 6️⃣ pricing_rules
INSERT INTO
    pricing_rules (
        name,
        applies_to,
        is_weekend,
        start_hour,
        end_hour,
        indoor_only,
        rule_type,
        value,
        is_active
    )
VALUES
    (
        'Weekend Court Multiplier',
        'COURT',
        TRUE,
        NULL,
        NULL,
        NULL,
        'MULTIPLIER',
        1.50,
        TRUE
    ),
    (
        'Night Time Discount',
        'COURT',
        FALSE,
        20,
        23,
        NULL,
        'FLAT',
        -50.00,
        TRUE
    ),
    (
        'Indoor Premium',
        'COURT',
        FALSE,
        NULL,
        NULL,
        TRUE,
        'MULTIPLIER',
        1.20,
        TRUE
    ),
    (
        'Equipment Peak Hours',
        'EQUIPMENT',
        FALSE,
        17,
        21,
        NULL,
        'MULTIPLIER',
        1.30,
        TRUE
    ),
    (
        'Coach Weekend Rate',
        'COACH',
        TRUE,
        NULL,
        NULL,
        NULL,
        'MULTIPLIER',
        1.40,
        TRUE
    );

-- 7️⃣ coach_availabilities
INSERT INTO
    coach_availabilities (coach_id, day_of_week, start_hour, end_hour)
VALUES
    (1, 1, 10, 14), -- Monday
    (2, 2, 16, 20), -- Tuesday
    (3, 3, 9, 12), -- Wednesday
    (4, 4, 14, 18), -- Thursday
    (5, 5, 8, 11);

-- Friday
-- 8️⃣ booking_equipments
INSERT INTO
    booking_equipments (booking_id, equipment_type_id, quantity, price)
VALUES
    (1, 1, 2, 100.00),
    (1, 2, 10, 50.00),
    (2, 3, 1, 20.00),
    (3, 1, 1, 50.00),
    (4, 4, 2, 60.00);

-- 9️⃣ booking_coaches
INSERT INTO
    booking_coaches (booking_id, coach_id, price)
VALUES
    (1, 1, 400.00),
    (2, 2, 300.00),
    (3, 3, 450.00),
    (4, 4, 350.00),
    (5, 5, 500.00);

COMMIT;