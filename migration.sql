-- Migration: Add booking statuses
-- This migration updates the Booking table to support PENDING, CONFIRMED, COMPLETED, and CANCELLED statuses

-- Update the default status for new bookings to PENDING
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- Update existing bookings that are past their end time to COMPLETED
UPDATE "Booking" 
SET "status" = 'COMPLETED' 
WHERE "endTime" < NOW() 
  AND "status" = 'CONFIRMED';

-- Note: The schema now supports the following statuses:
-- PENDING: New booking waiting for confirmation
-- CONFIRMED: Booking has been confirmed
-- COMPLETED: Booking has been completed (automatically set for past bookings)
-- CANCELLED: Booking has been cancelled
