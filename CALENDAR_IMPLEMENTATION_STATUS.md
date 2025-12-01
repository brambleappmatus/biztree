# Calendar Types Implementation Status

## ✅ Completed

### 1. Database Schema
- ✅ Created `CalendarType` enum (HOURLY_SERVICE, DAILY_RENTAL, TABLE_RESERVATION)
- ✅ Created `Worker` model
- ✅ Created `ServiceCategory` model
- ✅ Created `ServiceWorker` junction table
- ✅ Created `Table` model
- ✅ Created `FloorPlan` model
- ✅ Updated `Service` model with new fields
- ✅ Updated `Booking` model with new relations
- ✅ SQL migration file: `migration_calendar.sql`
- ✅ Feature keys SQL: `seed_calendar_features.sql`

### 2. Backend (Server Actions)
- ✅ Created `src/app/actions/calendar.ts` with CRUD for:
  - Workers (get, create, update, delete, assign/remove from service)
  - Service Categories (create, update, delete)
  - Tables (get, create, update, delete)
  - Floor Plans (get, save)
- ✅ Updated `createService` and `updateService` in `src/app/actions.ts`

### 3. Type Definitions
- ✅ Updated `src/types/booking.ts` with serialization for new fields
- ✅ `ProfileCore` automatically includes new fields via Prisma

### 4. Admin Components
- ✅ `WorkersManager` - full CRUD with image upload
- ✅ `TablesManager` - full CRUD
- ✅ `WorkersPage` - admin page with feature gating
- ✅ `TablesPage` - admin page with feature gating
- ✅ Updated `DockMenu` with Workers and Tables navigation
- ✅ Updated `ServicesManager` with:
  - Calendar type selector
  - Conditional fields for each type
  - Worker selection options
  - Daily rental fields (pricePerDay, minimumDays, minimumValue)
  - Table reservation fields (requiresTable, maxCapacity)

### 5. Customer Booking Flows
- ✅ Refactored `BookingFlow` as orchestrator
- ✅ Created `HourlyFlow` - standard appointment booking
- ✅ Created `DailyFlow` - date range selection with validation

## 🚧 In Progress / TODO

### 1. Database Migration
- ⚠️ **CRITICAL**: Run the SQL files manually:
  ```bash
  # Connect to your database and run:
  # 1. migration_calendar.sql
  # 2. seed_calendar_features.sql
  ```

### 2. Table Reservation Flow
- ⏳ Create `TableFlow` component
- ⏳ Number of people input
- ⏳ Optional table selection UI
- ⏳ Capacity validation

### 3. Floor Plan Editor
- ⏳ Create `FloorPlanEditor` component
- ⏳ Drag-and-drop table placement
- ⏳ Visual floor plan with background image
- ⏳ Admin page for floor plan management

### 4. Service Categories (Subcategories)
- ⏳ UI in `ServicesManager` to manage categories
- ⏳ Category selection in `HourlyFlow`
- ⏳ Price override per category

### 5. Worker Selection
- ⏳ Worker assignment UI in `ServicesManager`
- ⏳ Worker selection in `HourlyFlow` (when enabled)
- ⏳ Worker availability checking

### 6. Backend Enhancements
- ⏳ Update `createBooking` to handle:
  - Date ranges for DAILY_RENTAL
  - Worker assignment
  - Category selection
  - Table assignment
  - Number of people
  - Notes field
- ⏳ Update `getAvailability` for different calendar types
- ⏳ Capacity tracking for table reservations

### 7. Bookings Manager Updates
- ⏳ Display worker, category, table info
- ⏳ Show date ranges for daily rentals
- ⏳ Capacity tracking visualization
- ⏳ Filter by calendar type

### 8. Testing & Validation
- ⏳ Test all CRUD operations
- ⏳ Test tier gating
- ⏳ Test booking flows for all types
- ⏳ Mobile responsiveness
- ⏳ Edge cases (overlapping bookings, capacity limits)

## 📝 Notes

### Feature Keys Assignment
- **Free Tier**: `calendar_hourly_service` (basic only)
- **Pro Tier**: + `calendar_worker_management` + `calendar_service_categories`
- **Business Tier**: All features including `calendar_daily_rental`, `calendar_table_reservation`, `calendar_floor_plan`

### Known Issues
1. `DailyFlow` currently uses placeholder logic in `createBooking` - needs proper date range handling
2. Prisma migration stuck - using manual SQL instead
3. Need to update email templates for new booking types

### Next Immediate Steps
1. Run SQL migrations manually
2. Create `TableFlow` component
3. Update `createBooking` action to handle all calendar types
4. Test the complete flow end-to-end
