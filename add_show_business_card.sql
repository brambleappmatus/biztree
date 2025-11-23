-- Add showBusinessCard column to Profile table
-- This allows users to toggle the business card feature on/off in admin settings

ALTER TABLE "Profile" 
ADD COLUMN "showBusinessCard" BOOLEAN NOT NULL DEFAULT true;

-- Optional: Add comment to document the column
COMMENT ON COLUMN "Profile"."showBusinessCard" IS 'Toggle to show/hide business card (vizitka) feature on profile page';
