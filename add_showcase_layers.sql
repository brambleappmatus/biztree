-- Add ShowcaseLayer table for parallax effects
CREATE TABLE IF NOT EXISTS "ShowcaseLayer" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "showcaseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowcaseLayer_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "ShowcaseLayer_showcaseId_idx" ON "ShowcaseLayer"("showcaseId");
CREATE INDEX IF NOT EXISTS "ShowcaseLayer_order_idx" ON "ShowcaseLayer"("order");

-- Add foreign key constraint
ALTER TABLE "ShowcaseLayer" ADD CONSTRAINT "ShowcaseLayer_showcaseId_fkey" 
    FOREIGN KEY ("showcaseId") REFERENCES "Showcase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
