-- Create SystemSettings table for storing global application settings
CREATE TABLE IF NOT EXISTS "SystemSettings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- Create unique index on key
CREATE UNIQUE INDEX IF NOT EXISTS "SystemSettings_key_key" ON "SystemSettings"("key");

-- Insert default value for ENABLE_LIFETIME_DEALS (disabled by default)
INSERT INTO "SystemSettings" ("id", "key", "value", "updatedAt")
VALUES (
    'clsys_' || substr(md5(random()::text), 1, 21),
    'ENABLE_LIFETIME_DEALS',
    'false',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("key") DO NOTHING;
