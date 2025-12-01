-- Add new feature keys for calendar system
INSERT INTO "Feature" ("id", "key", "name", "description", "updatedAt") VALUES
('feat_cal_hourly', 'calendar_hourly_service', 'Hourly Service Bookings', 'Standard appointment-based bookings with time slots', NOW()),
('feat_cal_daily', 'calendar_daily_rental', 'Daily Rental Bookings', 'Multi-day rental bookings with minimum days/value', NOW()),
('feat_cal_table', 'calendar_table_reservation', 'Table Reservations', 'Capacity-based table reservations with floor plan', NOW()),
('feat_cal_worker', 'calendar_worker_management', 'Worker Management', 'Assign workers to services and bookings', NOW()),
('feat_cal_cat', 'calendar_service_categories', 'Service Subcategories', 'Create subcategories with different prices', NOW()),
('feat_cal_floor', 'calendar_floor_plan', 'Graphical Floor Plan', 'Visual floor plan editor for table reservations', NOW())
ON CONFLICT ("key") DO NOTHING;

-- Assign features to tiers (example: Business tier gets everything, Pro gets workers/categories)
-- You may need to adjust the tier names based on your actual data
-- Assuming 'Business' tier exists
INSERT INTO "TierFeature" ("id", "tierId", "featureId")
SELECT gen_random_uuid(), t.id, f.id
FROM "Tier" t, "Feature" f
WHERE t.name = 'Business' 
AND f.key IN ('calendar_hourly_service', 'calendar_daily_rental', 'calendar_table_reservation', 'calendar_worker_management', 'calendar_service_categories', 'calendar_floor_plan')
ON CONFLICT DO NOTHING;

-- Assuming 'Pro' tier exists
INSERT INTO "TierFeature" ("id", "tierId", "featureId")
SELECT gen_random_uuid(), t.id, f.id
FROM "Tier" t, "Feature" f
WHERE t.name = 'Pro' 
AND f.key IN ('calendar_hourly_service', 'calendar_worker_management', 'calendar_service_categories')
ON CONFLICT DO NOTHING;

-- Assuming 'Free' tier exists
INSERT INTO "TierFeature" ("id", "tierId", "featureId")
SELECT gen_random_uuid(), t.id, f.id
FROM "Tier" t, "Feature" f
WHERE t.name = 'Free' 
AND f.key IN ('calendar_hourly_service')
ON CONFLICT DO NOTHING;
