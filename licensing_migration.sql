CREATE TABLE "Tier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tier_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Feature" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TierFeature" (
    "id" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,

    CONSTRAINT "TierFeature_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Tier_name_key" ON "Tier"("name");

CREATE UNIQUE INDEX "Feature_key_key" ON "Feature"("key");

CREATE UNIQUE INDEX "TierFeature_tierId_featureId_key" ON "TierFeature"("tierId", "featureId");

ALTER TABLE "Profile" ADD COLUMN "tierId" TEXT;

ALTER TABLE "Profile" ADD CONSTRAINT "Profile_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "Tier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TierFeature" ADD CONSTRAINT "TierFeature_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "Tier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TierFeature" ADD CONSTRAINT "TierFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;
