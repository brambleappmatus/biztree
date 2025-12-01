-- Add location type fields to Service table
ALTER TABLE "Service" 
ADD COLUMN "locationType" TEXT DEFAULT 'business_address',
ADD COLUMN "customAddress" TEXT;

-- Add comment for documentation
COMMENT ON COLUMN "Service"."locationType" IS 'Location type: business_address, custom_address, or google_meet';
COMMENT ON COLUMN "Service"."customAddress" IS 'Custom address when locationType is custom_address';
