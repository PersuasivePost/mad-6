# QuickBite — Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (for testing)
- A Supabase project (free tier works)

## 1. Install Dependencies

```bash
cd QuickBite
npm install
```

## 2. Configure Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Open `lib/supabase.js` and replace the placeholder values:

```js
const SUPABASE_URL = 'https://YOUR-PROJECT-ID.supabase.co';
const SUPABASE_ANON_KEY = 'your-actual-anon-key';
```

You can find these in your Supabase dashboard under:
**Settings → API → Project URL** and **Project API keys (anon/public)**

## 3. Set Up Database Schema

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `docs/schema.sql`
5. Paste it into the SQL editor
6. Click **Run** to execute

This creates all required tables:
- `profiles` — User profiles with roles
- `vendors` — Canteen stalls
- `menu_items` — Food items per vendor
- `orders` — Student orders
- `order_items` — Individual items in each order
- `coupons` — Discount coupons

It also sets up:
- Row Level Security (RLS) policies
- Auto-profile creation trigger on signup
- Pickup token generation trigger
- Updated_at auto-update triggers

## 4. (Optional) Seed Sample Data

Uncomment the seed data section at the bottom of `docs/schema.sql` and run it in the SQL Editor. This adds sample vendors for testing.

## 5. Run the App

```bash
# Start the Expo dev server
npx expo start

# Or for specific platforms:
npx expo start --android
npx expo start --ios
npx expo start --web
```

Scan the QR code with Expo Go on your phone.

## 6. Project Structure

```
QuickBite/
├── app/
│   ├── _layout.jsx           # Root layout (auth check, fonts)
│   ├── index.jsx              # Entry redirect
│   ├── (auth)/
│   │   ├── _layout.jsx        # Auth stack layout
│   │   ├── login.jsx           # Login screen
│   │   ├── register.jsx        # Registration screen
│   │   ├── otp.jsx             # OTP verification
│   │   ├── forgot-password.jsx # Password reset
│   │   └── complete-profile.jsx# Profile completion
│   ├── (student)/
│   │   ├── _layout.jsx        # Student tab layout
│   │   ├── index.jsx          # Home dashboard
│   │   ├── vendor/[id].jsx    # Vendor menu
│   │   ├── cart.jsx           # Shopping cart
│   │   ├── checkout.jsx       # Payment
│   │   ├── order-tracking.jsx # Live tracking
│   │   ├── notifications.jsx  # Notifications
│   │   ├── favorites.jsx      # Favorites
│   │   ├── profile.jsx        # Profile & settings
│   │   ├── order-history.jsx  # Order history
│   │   └── wallet.jsx         # Wallet dashboard
│   ├── (employee)/
│   │   ├── _layout.jsx        # Employee tab layout
│   │   └── queue.jsx          # Order queue
│   └── (manager)/
│       ├── _layout.jsx        # Manager tab layout
│       ├── dashboard.jsx      # Analytics
│       └── menu.jsx           # Menu management
├── components/
│   ├── VendorCard.jsx
│   ├── MenuItemCard.jsx
│   └── OrderCard.jsx
├── lib/
│   ├── supabase.js            # Supabase client
│   ├── store.js               # Zustand store
│   └── theme.js               # Design tokens
├── docs/
│   ├── schema.sql             # Database schema
│   └── SETUP.md               # This file
└── global.css                 # NativeWind global styles
```

## 7. Environment Notes

- **JavaScript Only**: No TypeScript files. All `.js` or `.jsx`
- **NativeWind v4**: Tailwind CSS for React Native
- **Expo Router**: File-based routing
- **Zustand**: Lightweight state management
- **Supabase**: Auth + Database + Storage

## 8. Troubleshooting

### "Module not found" errors
```bash
npx expo start --clear
```

### NativeWind styles not applying
Make sure `global.css` is imported in `app/_layout.jsx` and `babel.config.js` includes the NativeWind preset.

### Supabase connection issues
- Check your URL and anon key are correct
- Ensure RLS policies are set up (run schema.sql)
- Check Supabase dashboard for any service disruptions
