# Buttonly (Next.js + Firebase)

A free personal link page builder with customizable avatars, backgrounds, button groups, themes, and social share links.

Images (avatar + background only) are stored as **compressed base64 data URLs** inside the Firestore page document — **no Firebase Storage**.

## Stack

- Next.js 16 (App Router) + React 19
- Native CSS (CSS modules + global tokens)
- Firebase Auth + Cloud Firestore

## Setup

### 1. Install

```bash
npm install
```

### 2. Firebase project

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Add a **Web** app and copy the config into `.env.local`
3. Create a **Cloud Firestore** database (start in **production mode** is fine)
4. **Important — publish security rules** (fixes “Missing or insufficient permissions”):
   - Open **Firestore Database → Rules**
   - Replace everything with the contents of `firestore.rules` in this repo
   - Click **Publish**
   - Wait a few seconds, then try signup again

### 2b. Enable Email/Password + Google auth

Open **Build → Authentication → Sign-in method**:

1. **Email/Password**
   - Click **Email/Password** → enable **Email/Password** → Save  
   - (Email link is optional; leave off for this app)

2. **Google**
   - Click **Google** → enable → choose a project support email → Save  
   - Under **Authentication → Settings → Authorized domains**, ensure `localhost` is listed (default)  
   - For production, add your real domain (e.g. `yourapp.vercel.app`)

3. Confirm both providers show as **Enabled** on the Sign-in method list

App routes:

| Method | Sign up | Log in |
|--------|---------|--------|
| Email/password | `/signup` form | `/login` form |
| Google | “Sign up with Google” (enter username first) | “Continue with Google” (new users pick username next) |

### 3. Environment

```bash
cp .env.example .env.local
```

Fill in:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

These are **public client** keys. Protect data with Firestore rules, not by hiding them.  
**Never commit** `.env.local`.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without env keys the app still boots and shows a “Firebase not configured” message.

## Features

- Public page at `/[username]` (e.g. `yoursite.com/alex`)
- Dashboard tabs: Profile, Appearance, Links, Share
- Avatar crop/zoom → compressed base64
- Background color or image, blur slider, top/right/bottom/left insets
- Light / dark theme per page
- Description font + color
- Button groups with auto favicons
- Button corner radius slider
- Share bar: X, Facebook, Instagram, Threads, TikTok, Reddit
- Debounced autosave to the user’s Firestore document

## Scripts

- `npm run dev` — development
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — ESLint

## Image size note

Firestore documents max out at **1 MiB**. Avatar and background are resized and JPEG-compressed in the browser before save (avatar ~150 KB, background ~500 KB budgets).
