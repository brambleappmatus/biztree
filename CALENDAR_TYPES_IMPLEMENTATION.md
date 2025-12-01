# Calendar Types Implementation Plan

## Overview
This document outlines the implementation of three distinct calendar/booking types for BizTree:
1. **Hourly Services** - For appointments with workers (e.g., haircuts with subcategories)
2. **Daily Rentals** - For multi-day bookings (e.g., holiday homes, equipment rentals)
3. **Table Reservations** - For capacity-based bookings with graphical floor plans

All features will be tier-gated and include comprehensive admin management.

---

## Database Schema Changes

### 1. New Models

#### CalendarType Enum
```prisma
enum CalendarType {
  HOURLY_SERVICE    // Standard appointment-based bookings
  DAILY_RENTAL      // Multi-day rentals
  TABLE_RESERVATION // Capacity-based table/space reservations
}
```

#### Worker Model
```prisma
model Worker {
  id          String   @id @default(cuid())
  name        String
  description String?
  imageUrl    String?  // Profile picture
  order       Int      @default(0)
  isActive    Boolean  @default(true)
  
  profileId   String
  profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  
  services    ServiceWorker[] // Many-to-many with services
  bookings    Booking[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([profileId])
  @@index([order])
}
```

#### ServiceCategory Model (for subcategories like "krátky strih", "dlhý strih")
```prisma
model ServiceCategory {
  id          String   @id @default(cuid())
  name        String   // e.g., "Krátky strih", "Dlhý strih"
  description String?
  price       Decimal? // Override service base price
  duration    Int?     // Override service base duration (in minutes)
  order       Int      @default(0)
  
  serviceId   String
  service     Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  
  bookings    Booking[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([serviceId])
  @@index([order])
}
```

#### ServiceWorker (Many-to-Many)
```prisma
model ServiceWorker {
  id        String   @id @default(cuid())
  serviceId String
  workerId  String
  service   Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  worker    Worker   @relation(fields: [workerId], references: [id], onDelete: Cascade)
  
  @@unique([serviceId, workerId])
}
```

#### Table Model (for table reservations)
```prisma
model Table {
  id          String   @id @default(cuid())
  name        String   // e.g., "Table 1", "VIP Section"
  capacity    Int      // Maximum number of people
  
  // Graphical position (for floor plan)
  positionX   Float?   // X coordinate in pixels/percentage
  positionY   Float?   // Y coordinate in pixels/percentage
  width       Float?   // Width for rendering
  height      Float?   // Height for rendering
  shape       String   @default("rectangle") // rectangle, circle, custom
  
  isActive    Boolean  @default(true)
  order       Int      @default(0)
  
  profileId   String
  profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  
  bookings    Booking[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([profileId])
}
```

#### FloorPlan Model
```prisma
model FloorPlan {
  id          String   @id @default(cuid())
  name        String   @default("Main Floor")
  imageUrl    String?  // Background image for floor plan
  width       Int      @default(1000) // Canvas width
  height      Int      @default(800)  // Canvas height
  
  profileId   String   @unique
  profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 2. Updated Models

#### Service Model Updates
```prisma
model Service {
  id             String       @id @default(cuid())
  name           String
  description    String?
  price          Decimal?
  duration       Int          // in minutes
  currency       String       @default("EUR")
  bookingEnabled Boolean      @default(true)
  
  // NEW FIELDS
  calendarType   CalendarType @default(HOURLY_SERVICE)
  
  // For DAILY_RENTAL
  minimumDays    Int?         // Minimum rental period
  minimumValue   Decimal?     // Minimum total value
  pricePerDay    Decimal?     // Daily rate
  
  // For TABLE_RESERVATION
  requiresTable  Boolean      @default(false)
  maxCapacity    Int?         // Max people per booking
  
  // Worker preferences
  allowWorkerSelection Boolean  @default(false)
  requireWorker        Boolean  @default(false)
  
  profileId      String
  profile        Profile      @relation(fields: [profileId], references: [id])
  
  bookings       Booking[]
  categories     ServiceCategory[]
  workers        ServiceWorker[]
  
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}
```

#### Booking Model Updates
```prisma
model Booking {
  id            String   @id @default(cuid())
  customerName  String
  customerEmail String
  customerPhone String?
  
  startTime     DateTime
  endTime       DateTime
  
  // NEW FIELDS
  numberOfPeople Int?     // For table reservations
  notes         String?  // Customer notes
  
  // Relations
  categoryId    String?
  category      ServiceCategory? @relation(fields: [categoryId], references: [id])
  
  workerId      String?
  worker        Worker?  @relation(fields: [workerId], references: [id])
  
  tableId       String?
  table         Table?   @relation(fields: [tableId], references: [id])
  
  status        String   @default("PENDING") // PENDING, CONFIRMED, COMPLETED, CANCELLED
  
  serviceId     String
  service       Service  @relation(fields: [serviceId], references: [id])
  
  profileId     String
  profile       Profile  @relation(fields: [profileId], references: [id])
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([categoryId])
  @@index([workerId])
  @@index([tableId])
}
```

#### Profile Model Updates
```prisma
model Profile {
  // ... existing fields ...
  
  workers       Worker[]
  tables        Table[]
  floorPlan     FloorPlan?
}
```

---

## Feature Keys for Tier Gating

Add these feature keys to the `Feature` table:

```typescript
const CALENDAR_FEATURES = [
  {
    key: 'calendar_hourly_service',
    name: 'Hourly Service Bookings',
    description: 'Standard appointment-based bookings with time slots'
  },
  {
    key: 'calendar_daily_rental',
    name: 'Daily Rental Bookings',
    description: 'Multi-day rental bookings with minimum days/value'
  },
  {
    key: 'calendar_table_reservation',
    name: 'Table Reservations',
    description: 'Capacity-based table reservations with floor plan'
  },
  {
    key: 'calendar_worker_management',
    name: 'Worker Management',
    description: 'Assign workers to services and bookings'
  },
  {
    key: 'calendar_service_categories',
    name: 'Service Subcategories',
    description: 'Create subcategories with different prices (e.g., short/long haircut)'
  },
  {
    key: 'calendar_floor_plan',
    name: 'Graphical Floor Plan',
    description: 'Visual floor plan editor for table reservations'
  }
];
```

### Suggested Tier Assignment
- **Free**: `calendar_hourly_service` (basic only, no workers, no categories)
- **Pro**: All hourly features + `calendar_worker_management` + `calendar_service_categories`
- **Business**: All features including `calendar_daily_rental`, `calendar_table_reservation`, `calendar_floor_plan`

---

## Implementation Steps

### Phase 1: Database Migration
1. Create migration file with all new models
2. Update existing Service and Booking models
3. Add feature keys to Feature table
4. Seed initial data if needed

### Phase 2: Backend API
1. Create server actions for:
   - Worker CRUD operations
   - Service category CRUD operations
   - Table CRUD operations
   - Floor plan management
   - Enhanced booking creation (with worker/category/table selection)

### Phase 3: Admin Components

#### 3.1 Worker Management (`/src/components/admin/workers-manager.tsx`)
- List all workers with images
- Add/Edit/Delete workers
- Drag-and-drop reordering
- Image upload integration
- Assign workers to services

#### 3.2 Service Categories Manager (extend `services-manager.tsx`)
- Add subcategories to services
- Set different prices/durations per category
- Reorder categories

#### 3.3 Table Management (`/src/components/admin/tables-manager.tsx`)
- List all tables
- Add/Edit/Delete tables
- Set capacity
- Basic positioning (enhanced in floor plan editor)

#### 3.4 Floor Plan Editor (`/src/components/admin/floor-plan-editor.tsx`)
- Drag-and-drop canvas
- Visual table placement
- Background image upload
- Save positions
- Real-time preview

#### 3.5 Enhanced Bookings Manager
- Filter by calendar type
- Show worker/category/table info
- Capacity tracking for table reservations
- Multi-day view for daily rentals

### Phase 4: Customer-Facing Booking Flow

#### 4.1 Hourly Service Flow
1. Select service
2. Select category (if available and unlocked)
3. Select worker (if enabled: "Any available" or specific worker)
4. Select date
5. Select time slot
6. Enter details
7. Confirm

#### 4.2 Daily Rental Flow
1. Select service
2. Select date range (with minimum days validation)
3. Calculate total price
4. Validate minimum value
5. Enter details
6. Confirm

#### 4.3 Table Reservation Flow
1. Select service/area
2. Select date and time
3. Enter number of people
4. Show available tables (optional: visual floor plan for customers)
5. Select table (or auto-assign)
6. Enter details
7. Confirm

### Phase 5: UI/UX Enhancements

#### 5.1 Locked Feature UI
- Show blurred/locked badge for unavailable calendar types
- "Upgrade to unlock" CTA
- Consistent with existing tier gating

#### 5.2 Admin Dashboard Updates
- Add "Workers" tab
- Add "Tables & Floor Plan" tab
- Update "Services" tab with calendar type selector
- Update "Bookings" with enhanced filters

#### 5.3 Mobile Responsiveness
- Ensure all new components work on mobile
- Touch-friendly floor plan editor
- Responsive booking flows

---

## File Structure

```
/src
  /components
    /admin
      workers-manager.tsx          [NEW]
      tables-manager.tsx           [NEW]
      floor-plan-editor.tsx        [NEW]
      service-categories-manager.tsx [NEW]
      bookings-manager.tsx         [UPDATE]
      services-manager.tsx         [UPDATE]
    /booking
      booking-flow.tsx             [UPDATE]
      hourly-booking-flow.tsx      [NEW]
      daily-rental-flow.tsx        [NEW]
      table-reservation-flow.tsx   [NEW]
    /ui
      floor-plan-canvas.tsx        [NEW]
      worker-selector.tsx          [NEW]
      category-selector.tsx        [NEW]
      date-range-picker.tsx        [NEW]
  /app
    /actions
      workers.ts                   [NEW]
      tables.ts                    [NEW]
      floor-plans.ts               [NEW]
      bookings.ts                  [UPDATE]
  /types
    booking.ts                     [UPDATE]
    calendar.ts                    [NEW]
  /lib
    calendar-utils.ts              [NEW]
    availability-checker.ts        [UPDATE]
```

---

## Testing Checklist

### Tier Gating
- [ ] Free tier can only use basic hourly bookings
- [ ] Pro tier can use workers and categories
- [ ] Business tier can use all calendar types
- [ ] Locked features show upgrade prompts

### Hourly Service
- [ ] Worker selection works (any/specific)
- [ ] Categories show different prices
- [ ] Time slots respect worker availability
- [ ] Bookings save with correct worker/category

### Daily Rental
- [ ] Minimum days validation works
- [ ] Minimum value validation works
- [ ] Price calculation is correct
- [ ] Date range picker works
- [ ] Overlapping bookings are prevented

### Table Reservation
- [ ] Capacity tracking works
- [ ] Tables show as unavailable when booked
- [ ] Floor plan editor saves positions
- [ ] Visual floor plan displays correctly
- [ ] Auto-assignment works when table not selected

### Admin Management
- [ ] All CRUD operations work
- [ ] Images upload correctly
- [ ] Reordering works
- [ ] Bookings display all new fields
- [ ] Filtering by calendar type works

---

## Migration Script Template

```sql
-- Add CalendarType enum
CREATE TYPE "CalendarType" AS ENUM ('HOURLY_SERVICE', 'DAILY_RENTAL', 'TABLE_RESERVATION');

-- Create Worker table
CREATE TABLE "Worker" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "imageUrl" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "profileId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Worker_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE
);

-- Create ServiceCategory table
CREATE TABLE "ServiceCategory" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" DECIMAL(65,30),
  "duration" INTEGER,
  "order" INTEGER NOT NULL DEFAULT 0,
  "serviceId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ServiceCategory_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE
);

-- Create ServiceWorker junction table
CREATE TABLE "ServiceWorker" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "serviceId" TEXT NOT NULL,
  "workerId" TEXT NOT NULL,
  CONSTRAINT "ServiceWorker_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE,
  CONSTRAINT "ServiceWorker_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE,
  UNIQUE("serviceId", "workerId")
);

-- Create Table model
CREATE TABLE "Table" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "capacity" INTEGER NOT NULL,
  "positionX" DOUBLE PRECISION,
  "positionY" DOUBLE PRECISION,
  "width" DOUBLE PRECISION,
  "height" DOUBLE PRECISION,
  "shape" TEXT NOT NULL DEFAULT 'rectangle',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  "profileId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Table_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE
);

-- Create FloorPlan table
CREATE TABLE "FloorPlan" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL DEFAULT 'Main Floor',
  "imageUrl" TEXT,
  "width" INTEGER NOT NULL DEFAULT 1000,
  "height" INTEGER NOT NULL DEFAULT 800,
  "profileId" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FloorPlan_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE
);

-- Update Service table
ALTER TABLE "Service" ADD COLUMN "calendarType" "CalendarType" NOT NULL DEFAULT 'HOURLY_SERVICE';
ALTER TABLE "Service" ADD COLUMN "minimumDays" INTEGER;
ALTER TABLE "Service" ADD COLUMN "minimumValue" DECIMAL(65,30);
ALTER TABLE "Service" ADD COLUMN "pricePerDay" DECIMAL(65,30);
ALTER TABLE "Service" ADD COLUMN "requiresTable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Service" ADD COLUMN "maxCapacity" INTEGER;
ALTER TABLE "Service" ADD COLUMN "allowWorkerSelection" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Service" ADD COLUMN "requireWorker" BOOLEAN NOT NULL DEFAULT false;

-- Update Booking table
ALTER TABLE "Booking" ADD COLUMN "numberOfPeople" INTEGER;
ALTER TABLE "Booking" ADD COLUMN "notes" TEXT;
ALTER TABLE "Booking" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "workerId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "tableId" TEXT;

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id");
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id");
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id");

-- Create indexes
CREATE INDEX "Worker_profileId_idx" ON "Worker"("profileId");
CREATE INDEX "Worker_order_idx" ON "Worker"("order");
CREATE INDEX "ServiceCategory_serviceId_idx" ON "ServiceCategory"("serviceId");
CREATE INDEX "ServiceCategory_order_idx" ON "ServiceCategory"("order");
CREATE INDEX "Table_profileId_idx" ON "Table"("profileId");
CREATE INDEX "Booking_categoryId_idx" ON "Booking"("categoryId");
CREATE INDEX "Booking_workerId_idx" ON "Booking"("workerId");
CREATE INDEX "Booking_tableId_idx" ON "Booking"("tableId");
```

---

## Next Steps

1. Review and approve this implementation plan
2. Create database migration
3. Update Prisma schema
4. Run migration
5. Implement backend actions
6. Build admin components
7. Update booking flows
8. Add tier gating
9. Test thoroughly
10. Deploy

