# Calendar System - Current Status

## ✅ What's Working Now

### Backend
- ✅ `createBooking` accepts all new fields: `numberOfPeople`, `notes`, `workerId`, `categoryId`, `tableId`, `endDate`
- ✅ **Daily Rental validation**: Properly checks for overlapping date ranges
- ✅ **Table Reservation validation**: Checks if specific table is available (when tableId provided)
- ✅ **Hourly Service validation**: Standard time slot checking

### Customer Booking Flows
- ✅ **DailyFlow**: Date range selection with validation, passes `endDate`
- ✅ **TableFlow**: Number of people selector, notes field, passes both to backend
- ✅ **HourlyFlow**: Standard time slot booking (existing functionality)

## ⚠️ Still Missing

### 1. Worker Selection (Hourly Services)
**Status**: Not implemented  
**What's needed**:
- Fetch available workers for the service
- Display worker cards with photos in HourlyFlow
- Allow customer to select a worker (if `allowWorkerSelection` is true)
- Make worker selection required (if `requireWorker` is true)
- Pass `workerId` to `createBooking`

**Files to modify**:
- `src/components/booking/hourly-flow.tsx`
- Need to create action to fetch workers: `getServiceWorkers(serviceId)`

### 2. Table Selection (Table Reservations)
**Status**: Not implemented  
**What's needed**:
- Fetch available tables for the profile
- Filter tables by capacity (>= numberOfPeople)
- Display table cards in TableFlow
- Allow customer to select a table (if `requiresTable` is true)
- Pass `tableId` to `createBooking`

**Files to modify**:
- `src/components/booking/table-flow.tsx`
- Need to create action to fetch tables: `getAvailableTables(profileId, date, time, numberOfPeople)`

### 3. Service Categories (Subcategories)
**Status**: Backend ready, UI not implemented  
**What's needed**:
- Admin UI to manage categories in ServicesManager
- Display categories in HourlyFlow for customer selection
- Pass `categoryId` to `createBooking`
- Use category price/duration if set (override service defaults)

**Files to modify**:
- `src/components/admin/services-manager.tsx`
- `src/components/booking/hourly-flow.tsx`

## 🎯 Priority Order

### High Priority (Core Functionality)
1. **Worker Selection** - Critical for barber shops, salons, etc.
2. **Table Selection** - Important for restaurants

### Medium Priority (Nice to Have)
3. **Service Categories** - Useful for services with variations

## 📝 Quick Implementation Guide

### Adding Worker Selection

```typescript
// 1. Create server action in src/app/actions/calendar.ts
export async function getServiceWorkers(serviceId: string) {
  const workers = await prisma.serviceWorker.findMany({
    where: { serviceId },
    include: { worker: true }
  });
  return workers.map(sw => sw.worker).filter(w => w.isActive);
}

// 2. In hourly-flow.tsx, add state and fetch
const [workers, setWorkers] = useState([]);
const [selectedWorkerId, setSelectedWorkerId] = useState(null);

useEffect(() => {
  if (service.allowWorkerSelection) {
    getServiceWorkers(service.id).then(setWorkers);
  }
}, [service.id]);

// 3. Add worker selection UI after time selection
// 4. Pass workerId to createBooking
```

### Adding Table Selection

```typescript
// 1. Create server action
export async function getAvailableTables(
  profileId: string,
  date: string,
  time: string,
  numberOfPeople: number
) {
  // Get all tables with capacity >= numberOfPeople
  // Filter out tables that are already booked for this time
  // Return available tables
}

// 2. In table-flow.tsx, fetch after time selection
// 3. Display table cards
// 4. Pass tableId to createBooking
```

## 🐛 Known Issues

1. **Worker assignment** - Workers can be created but not yet assigned to services in the UI
2. **Floor plan** - Tables can be created but floor plan editor doesn't exist yet
3. **Bookings display** - Admin bookings manager doesn't show new fields (worker, table, notes, etc.)

## ✨ What You Can Test Right Now

1. **Daily Rentals**:
   - Create a service with `DAILY_RENTAL` type
   - Set minimum days, minimum value, price per day
   - Book a date range
   - Try to book overlapping dates (should be blocked!)

2. **Table Reservations**:
   - Create a service with `TABLE_RESERVATION` type
   - Set max capacity
   - Book with number of people
   - Add notes for special requests

3. **Hourly Services**:
   - Works as before
   - Can set `allowWorkerSelection` and `requireWorker` flags
   - (Worker selection UI not yet implemented)
