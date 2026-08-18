# STAYUNKNOWN mobile app

Expo SDK 54 / React Native 0.81 / React 19.1.

## Run

```bash
npm install
npx expo start
```

Use `npm run typecheck` after dependencies are installed.

## Backend

The app is wired to the existing STAYUNKNOWN backend at:

`https://stayunknown404-backend.onrender.com`

The client uses the existing catalog, collection, authentication, wishlist, profile, order, Paystack, support, restock, and admin endpoints found in the supplied backend source.

## Payment callback

The app uses the `stayunknown://payment-complete` callback scheme for returning from Paystack. The Paystack configuration must allow the callback URL used by the deployed mobile build.

## Admin authorization

The app never decides who is an admin from a hard-coded client-side email list. It calls `/api/admin/me`, and the backend remains authoritative.
