# Stripe Payment & Tier Switching - Fix Implementation Plan

## Issues Identified

1. **Monthly payments work but yearly doesn't switch tier**
2. **Yearly Business tier button shows "unavailable"**
3. **Lifetime payment doesn't work - doesn't switch tier**

---

## Root Cause Analysis

### Issue 1 & 3: Tier Not Switching for Yearly/Lifetime Payments

**Problem**: The webhook handler (`handleCheckoutCompleted`) only processes `subscription` mode checkouts properly. Lifetime payments use `payment` mode (one-time payment), which has different event structure and flow.

**Current Flow**:
- Monthly/Yearly: `mode: 'subscription'` → Creates Stripe subscription → `checkout.session.completed` webhook → Has `subscription` object
- Lifetime: `mode: 'payment'` → One-time payment → `checkout.session.completed` webhook → NO `subscription` object

**Code Issue** (webhook/route.ts:87-90):
```typescript
if (!customer || !subscription || !metadata?.profileId) {
    console.error("Missing required data in checkout session", { customer, subscription, metadata });
    return;
}
```
This check fails for lifetime payments because there's no `subscription` field.

### Issue 2: Yearly Business Tier Shows "Unavailable"

**Problem**: Missing environment variable `STRIPE_BUSINESS_YEARLY_PRICE_ID`

**Evidence** (pricing-section.tsx:237-240):
```typescript
{priceId || isFree ? (
    <SubscriptionActions ... />
) : (
    <div className="w-full py-2.5 text-center text-gray-400 text-sm">
        Nedostupné
    </div>
)}
```

When `priceId` is empty/undefined, it shows "Nedostupné" (Unavailable).

---

## Implementation Plan

### Phase 1: Fix Environment Variables ✅

**Files to check**: `.env` (user needs to verify)

**Required Variables**:
```env
# Monthly
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_BUSINESS_PRICE_ID=price_xxx

# Yearly
STRIPE_PRO_YEARLY_PRICE_ID=price_xxx
STRIPE_BUSINESS_YEARLY_PRICE_ID=price_xxx

# Lifetime
STRIPE_PRO_LIFETIME_PRICE_ID=price_xxx
STRIPE_BUSINESS_LIFETIME_PRICE_ID=price_xxx
ENABLE_LIFETIME_DEALS=true

# Prices (for display)
STRIPE_BUSINESS_LIFETIME_PRICE=69
STRIPE_PRO_LIFETIME_PRICE=119
```

**Action**: User needs to create these price IDs in Stripe Dashboard and add to `.env`

---

### Phase 2: Fix Webhook Handler for Lifetime Payments 🔧

**File**: `src/app/api/stripe/webhook/route.ts`

**Changes Needed**:

1. **Add new event handler for one-time payments**:
   - Listen to `checkout.session.completed` for `mode: 'payment'`
   - Handle lifetime tier upgrades
   - Create subscription record with special status

2. **Modify `handleCheckoutCompleted` function**:
   - Check session mode (`subscription` vs `payment`)
   - For `payment` mode: Handle lifetime upgrade differently
   - For `subscription` mode: Keep existing logic

3. **Add helper function `handleLifetimePayment`**:
   ```typescript
   async function handleLifetimePayment(session: Stripe.Checkout.Session) {
       // Extract customer, metadata
       // Get tier from price ID
       // Update profile to new tier
       // Set subscriptionStatus to "LIFETIME"
       // Set subscriptionExpiresAt to null (never expires)
       // Create subscription record with status "LIFETIME"
       // Create history record
   }
   ```

**Implementation Details**:

```typescript
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    console.log("=== WEBHOOK: Checkout Completed ===");
    const { customer, subscription, metadata, mode, payment_intent } = session;
    
    // Check if this is a lifetime payment (one-time)
    if (mode === 'payment') {
        await handleLifetimePayment(session);
        return;
    }
    
    // Existing subscription logic...
    if (!customer || !subscription || !metadata?.profileId) {
        console.error("Missing required data in checkout session");
        return;
    }
    // ... rest of existing code
}

async function handleLifetimePayment(session: Stripe.Checkout.Session) {
    const { customer, metadata, amount_total } = session;
    
    if (!customer || !metadata?.profileId) {
        console.error("Missing required data for lifetime payment");
        return;
    }
    
    const customerId = typeof customer === 'string' ? customer : customer.id;
    
    // Get the line items to determine which tier was purchased
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0]?.price?.id;
    
    if (!priceId) {
        console.error("No price ID found in checkout session");
        return;
    }
    
    // Get tier from price ID
    const tier = await getTierFromPriceId(priceId);
    
    if (!tier) {
        console.error("Could not find tier for price:", priceId);
        return;
    }
    
    // Create or update subscription record for lifetime
    await prisma.subscription.upsert({
        where: { 
            profileId_tierId: {
                profileId: metadata.profileId,
                tierId: tier.id
            }
        },
        create: {
            profileId: metadata.profileId,
            tierId: tier.id,
            stripeCustomerId: customerId,
            stripePriceId: priceId,
            status: "LIFETIME",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date('2099-12-31'), // Far future date
        },
        update: {
            status: "LIFETIME",
            stripePriceId: priceId,
        }
    });
    
    // Update profile
    await prisma.profile.update({
        where: { id: metadata.profileId },
        data: {
            tierId: tier.id,
            subscriptionStatus: "LIFETIME",
            subscriptionExpiresAt: null, // Never expires
            trialEndsAt: null,
        }
    });
    
    // Create history record
    await prisma.subscriptionHistory.create({
        data: {
            profileId: metadata.profileId,
            action: "UPGRADED",
            newTierId: tier.id,
            performedBy: "USER",
            performedByUserId: metadata.userId,
            notes: `Purchased ${tier.name} lifetime license`
        }
    });
    
    console.log(`✅ Lifetime payment processed for profile ${metadata.profileId}`);
    console.log(`✅ Upgraded to tier: ${tier.name}`);
}
```

**Note**: Need to update Prisma schema to add unique constraint or handle upsert differently.

---

### Phase 3: Update getTierFromPriceId Helper 🔧

**File**: `src/app/api/stripe/webhook/route.ts`

**Current Code** (lines 397-411):
```typescript
async function getTierFromPriceId(priceId: string): Promise<{ id: string; name: string } | null> {
    const priceToTierMap: Record<string, string> = {
        [process.env.STRIPE_BUSINESS_PRICE_ID!]: "Business",
        [process.env.STRIPE_PRO_PRICE_ID!]: "Pro",
    };
    
    const tierName = priceToTierMap[priceId];
    if (!tierName) return null;
    
    return await prisma.tier.findUnique({
        where: { name: tierName },
        select: { id: true, name: true }
    });
}
```

**Updated Code**:
```typescript
async function getTierFromPriceId(priceId: string): Promise<{ id: string; name: string } | null> {
    const priceToTierMap: Record<string, string> = {
        // Monthly
        [process.env.STRIPE_BUSINESS_PRICE_ID!]: "Business",
        [process.env.STRIPE_PRO_PRICE_ID!]: "Pro",
        // Yearly
        [process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID!]: "Business",
        [process.env.STRIPE_PRO_YEARLY_PRICE_ID!]: "Pro",
        // Lifetime
        [process.env.STRIPE_BUSINESS_LIFETIME_PRICE_ID!]: "Business",
        [process.env.STRIPE_PRO_LIFETIME_PRICE_ID!]: "Pro",
    };
    
    const tierName = priceToTierMap[priceId];
    if (!tierName) {
        console.error("Unknown price ID:", priceId);
        console.error("Available mappings:", priceToTierMap);
        return null;
    }
    
    return await prisma.tier.findUnique({
        where: { name: tierName },
        select: { id: true, name: true }
    });
}
```

---

### Phase 4: Update Database Schema (Optional) 🔧

**File**: `prisma/schema.prisma`

**Current Issue**: The `Subscription` model requires `stripeSubscriptionId` for subscriptions, but lifetime payments don't have one.

**Solution**: Make `stripeSubscriptionId` truly optional and add a `type` field.

**Changes**:
```prisma
model Subscription {
  id                    String   @id @default(cuid())
  profileId             String
  profile               Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)
  
  tierId                String
  tier                  Tier     @relation(fields: [tierId], references: [id])
  
  type                  String   @default("RECURRING") // RECURRING, LIFETIME
  status                String   @default("ACTIVE") // ACTIVE, CANCELLED, PAST_DUE, UNPAID, LIFETIME
  
  // Stripe Integration
  stripeCustomerId      String?
  stripeSubscriptionId  String?  @unique
  stripePriceId         String?
  stripePaymentIntentId String?  // For one-time payments
  
  // Subscription Period
  currentPeriodStart    DateTime
  currentPeriodEnd      DateTime
  
  // Cancellation
  cancelAtPeriodEnd     Boolean  @default(false)
  cancelledAt           DateTime?
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([profileId])
  @@index([stripeSubscriptionId])
}
```

**Migration Required**: Yes

---

### Phase 5: Handle Invoice Events for Yearly Subscriptions 🔧

**File**: `src/app/api/stripe/webhook/route.ts`

**Issue**: Yearly subscriptions might not be updating tier properly on renewal.

**Current Code** (lines 304-354):
The `handlePaymentSucceeded` function updates subscription period but doesn't verify tier.

**Enhancement**:
```typescript
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
    const { subscription, customer } = invoice as any;

    if (!subscription) return;

    const subscriptionId = typeof subscription === 'string' ? subscription : subscription.id;

    const existingSubscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId }
    });

    if (!existingSubscription) {
        console.error("Subscription not found:", subscriptionId);
        return;
    }

    // Get updated subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription;
    const currentPeriodEnd = new Date((stripeSubscription as any).current_period_end * 1000);
    
    // Get tier from current price (in case it changed)
    const priceId = stripeSubscription.items.data[0].price.id;
    const tier = await getTierFromPriceId(priceId);
    
    if (!tier) {
        console.error("Could not find tier for price:", priceId);
        return;
    }

    // Update subscription period AND tier
    await prisma.subscription.update({
        where: { stripeSubscriptionId: subscriptionId },
        data: {
            currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
            currentPeriodEnd,
            status: "ACTIVE",
            tierId: tier.id, // ✅ Update tier
            stripePriceId: priceId, // ✅ Update price ID
        }
    });

    // Update profile expiration AND tier
    await prisma.profile.update({
        where: { id: existingSubscription.profileId },
        data: {
            subscriptionExpiresAt: currentPeriodEnd,
            subscriptionStatus: "ACTIVE",
            tierId: tier.id, // ✅ Update tier
        }
    });

    // Create history record
    await prisma.subscriptionHistory.create({
        data: {
            profileId: existingSubscription.profileId,
            action: "RENEWED",
            newTierId: tier.id,
            performedBy: "SYSTEM",
            notes: `Payment succeeded, subscription renewed until ${currentPeriodEnd.toISOString()}`
        }
    });

    console.log(`Payment succeeded for subscription: ${subscriptionId}`);
}
```

---

### Phase 6: Testing Plan 🧪

**Test Cases**:

1. **Monthly Subscription (Already Working)**
   - ✅ Subscribe to Business Monthly
   - ✅ Verify tier switches immediately after checkout
   - ✅ Verify 7-day trial is applied
   - ✅ Verify renewal works correctly

2. **Yearly Subscription**
   - 🔧 Subscribe to Business Yearly
   - 🔧 Verify tier switches immediately after checkout
   - 🔧 Verify correct expiration date (1 year from now)
   - 🔧 Verify renewal after 1 year updates tier

3. **Lifetime Payment**
   - 🔧 Purchase Business Lifetime
   - 🔧 Verify tier switches immediately after checkout
   - 🔧 Verify subscriptionStatus is "LIFETIME"
   - 🔧 Verify subscriptionExpiresAt is null
   - 🔧 Verify no renewal events

4. **Edge Cases**
   - 🔧 User already has monthly subscription, upgrades to yearly
   - 🔧 User already has yearly subscription, upgrades to lifetime
   - 🔧 Missing environment variables (should show error, not "unavailable")

---

## Implementation Order

1. ✅ **Verify Environment Variables** (User action required)
2. 🔧 **Update `getTierFromPriceId` helper** (Quick win)
3. 🔧 **Add `handleLifetimePayment` function** (Core fix)
4. 🔧 **Modify `handleCheckoutCompleted` to route by mode** (Core fix)
5. 🔧 **Enhance `handlePaymentSucceeded` to update tier** (Yearly fix)
6. 🔧 **Update Prisma schema** (Optional, for cleaner data model)
7. 🧪 **Test all payment flows** (Validation)

---

## Files to Modify

1. `src/app/api/stripe/webhook/route.ts` - Main webhook handler
2. `prisma/schema.prisma` - Database schema (optional)
3. `.env` - Environment variables (user action)

---

## Estimated Complexity

- **Phase 1**: Low (User verification)
- **Phase 2**: Medium (New function, logic branching)
- **Phase 3**: Low (Simple mapping update)
- **Phase 4**: Medium (Schema change, migration)
- **Phase 5**: Low (Enhancement to existing function)
- **Phase 6**: Medium (Comprehensive testing)

**Total Time**: 2-3 hours

---

## Success Criteria

✅ Monthly subscriptions continue to work
✅ Yearly subscriptions switch tier immediately after payment
✅ Yearly Business tier button shows price, not "unavailable"
✅ Lifetime payments switch tier immediately after payment
✅ Lifetime subscriptions never expire
✅ All payment flows create proper subscription history records
✅ Webhook logs show clear success/error messages

---

## Notes

- **Stripe CLI**: Use `stripe listen --forward-to localhost:3000/api/stripe/webhook` for local testing
- **Webhook Secret**: Ensure `STRIPE_WEBHOOK_SECRET` is set correctly for production
- **Idempotency**: Stripe webhooks may be sent multiple times, ensure handlers are idempotent
- **Error Handling**: All handlers should log errors clearly for debugging
