# Business Card Feature - Complete Setup Instructions

## ✅ What's Been Done

1. **Component Created**: `AddToWalletButton` - Mobile-only button that generates vCard files
2. **Translations Added**: Multi-language support (SK, CZ, EN, PL, HU)
3. **Profile Page Updated**: Button appears below contact buttons (mobile only)
4. **Admin Toggle Added**: Control in admin settings to enable/disable feature
5. **API Endpoints Created**: `/api/wallet/apple/[subdomain]` and `/api/wallet/google/[subdomain]`

## 🔧 Setup Steps (Run These)

### Step 1: Run the SQL Migration

Run this SQL in your database:

```sql
ALTER TABLE "Profile" 
ADD COLUMN "showBusinessCard" BOOLEAN NOT NULL DEFAULT true;
```

Or use the provided file:
```bash
# The SQL is in: /Users/matusstano/Desktop/biztree/add_show_business_card.sql
# Run it in your database client or via psql
```

### Step 2: Regenerate Prisma Client

After running the SQL, regenerate the Prisma client:

```bash
npx prisma generate
```

This will update the TypeScript types to include the new `showBusinessCard` field.

### Step 3: Restart Dev Server

The dev server should auto-reload, but if you see TypeScript errors, restart it:

```bash
# Kill the current server (Ctrl+C) and restart
npm run dev
```

## 📱 How It Works

### User Experience

1. **Mobile users** (iOS/Android) see "Uložiť vizitku" button
2. **Desktop users** don't see the button (mobile-only feature)
3. Tapping the button downloads a `.vcf` vCard file
4. User can save to their Contacts app

### Admin Control

In **Admin Settings → Kontakt section**, there's a new toggle:

- **Label**: "Zobraziť vizitku"
- **Description**: "Umožniť návštevníkom stiahnuť vašu vizitku do telefónu"
- **Default**: Enabled (true)
- **Effect**: When disabled, the button won't appear on the profile page

## 📂 Files Modified

### New Files
- `src/components/blocks/add-to-wallet-button.tsx` - Main component
- `src/app/api/wallet/apple/[subdomain]/route.ts` - Apple endpoint
- `src/app/api/wallet/google/[subdomain]/route.ts` - Google endpoint
- `add_show_business_card.sql` - Database migration

### Modified Files
- `src/lib/i18n.ts` - Added wallet translations
- `src/app/app/[subdomain]/page.tsx` - Added button to profile
- `src/components/admin/profile-form.tsx` - Added admin toggle
- `prisma/schema.prisma` - Added showBusinessCard field

## 🎯 Current Status

- ✅ Component works on mobile (iOS/Android)
- ✅ Hidden on desktop
- ✅ Uses simple text "Uložiť vizitku"
- ✅ Generates vCard format (universal compatibility)
- ✅ Admin toggle to enable/disable
- ⏳ **Waiting for**: SQL migration + Prisma regeneration

## 🔄 Next Steps (Optional Future Enhancements)

If you want native wallet integration later:

1. **Apple Wallet PKPass**: Requires Apple Developer account ($99/year)
2. **Google Wallet Pass API**: Free but requires Google Cloud setup
3. **Third-Party Service**: PassKit.io or similar (~$10-50/month)

For now, the vCard approach works universally and requires no additional setup!
