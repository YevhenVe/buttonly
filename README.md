# Agent Instructions & Project Context: Buttonly

## Project Overview
**Project Name:** Buttonly  
**Stack:** Next.js 16 (App Router) + Firebase (Auth & Firestore)  
**Description:** A free "link tree" personal page builder. Public pages live at `/:username` with customizable avatars, backgrounds, buttons, themes, and sharing options. Images (avatar + background) are stored as **compressed base64 data-URLs directly within the Firestore document** — Firebase Storage is NOT used.

---

## Tech Stack & Versions
- **Framework:** Next.js 16.3.0 (App Router)
  > ⚠️ **CRITICAL RULE:** Per `AGENTS.md` rules, this is NOT standard Next.js. Always read documentation in `node_modules/next/dist/docs/` before writing code due to breaking changes.
- **Library/Language:** React 19.2.8, TypeScript 5 (strict mode), `react-compiler: true` in `next.config.ts`
- **Database & Auth:** Firebase JS SDK 12.17.0 (Auth + Firestore)
- **Utilities:** `react-easy-crop` 6.2.3 (avatar cropping)
- **Styling:** Native CSS Modules + global CSS variables/tokens in `globals.css` (No CSS frameworks)
- **Path Alias:** `@/*` → `./src/*`
- **Runtime:** Node v24.15.0, npm 11.14.1

---

## Setup & Local Development

### 1. Install & Run
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000). Without env keys, the app still boots and shows a “Firebase not configured” message.

### 2. Environment Variables (`.env.local`)
Copy `.env.example` to `.env.local` and fill in your public client keys:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```
*Note: Protect data with Firestore rules, not by hiding these keys. Never commit `.env.local`.*

### 3. Firebase Configuration
1. **Firestore Rules:** Replace default rules with the contents of `firestore.rules` from this repo and publish.
2. **Auth:** Enable **Email/Password** and **Google** sign-in providers in the Firebase Console. Add `localhost` (and your production domain) to Authorized domains.

### 4. Scripts
- `npm run dev` — development
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — ESLint

---

## Data Structure & Architecture

### Data Models (`src/lib/types.ts`)
Unified `PageDocument` structure:
```typescript
{
  uid: string;
  username: string;
  updatedAt: string;
  is18Plus: boolean;
  profile: {
    displayName: string;
    description: string;
    descriptionFont: string;
    descriptionColor: string;
    avatarDataUrl: string;
    nameBackground: string;
    descriptionBackground: string;
  };
  theme: 'light' | 'dark';
  background: {
    type: 'color' | 'image';
    color: string;
    imageDataUrl: string;
    blur: number;
    zoom: number; // NOTE: strictly zoom, no insets.
  };
  buttonStyle: {
    borderRadius: number;
    opacity: number;
    blur: number;
    backgroundColor: string;
    textColor: string;
  };
  groupTitleStyle: {
    background: string;
  };
  groups: ButtonGroup[];
  share: ShareSettings;
  shareEnabled: boolean;
}
```
- Includes helper functions `createDefaultPage()` and **`normalizePageDocument()`**.
- **Important:** `normalizePageDocument()` acts as a safeguard against legacy or incomplete documents. Any new field added to the schema **must** be populated with default values here.

### Firestore Rules & Access
- `usernames/{username}` → `{uid, createdAt}`: Handles unique username reservation. Create-only by owner; unchangeable (no handle transfers).
- `pages/{uid}` → `{uid, username, ...}`: Public read access; write access restricted to document owner.

### Firebase Layer
- **`src/lib/firebase/pages.ts`:**
  - `claimUsernameAndCreatePage`: Transactional handle reservation + page creation.
  - `getPageByUid` / `getPageByUsername` (resolves via `usernames -> uid`).
  - `savePage` / `patchPage` / `buildPageUpdate`: Performs **delta updates** to prevent re-uploading large base64 strings on minor field updates.
  - `pageContentKey`: Generates content hash without `updatedAt` for dirty checking.
- **`src/lib/firebase/auth.ts`:** `signUpWithEmail`, `signInWithEmail`, `signInWithGoogle(username?)`, `logOut`. Cleans up accounts if handle reservation fails.

### Image Handling & Size Limits
Firestore documents max out at **1 MiB**. 
- Avatar and background are resized and compressed (WebP with JPEG fallback) in the browser before saving. 
- Strict budgets: **Avatar ≤ 150 KB**, **Background ≤ 720 KB**. Uses `estimatePageImagePayloadBytes` to enforce this.

---

## App Router Structure
- `/` — Landing page using marketing shell.
- `/signup`, `/login` — Auth pages. `?google=1` prompts handle selection post-auth.
- `/dashboard` — Client-side builder wrapped in `AuthGuard` + `PageEditorProvider`. Features Profile, Appearance, Links, and Share tabs. Contains a **manual Save button** with automatic retry logic for `resource-exhausted` errors (NO autosave).
- `/[username]` — Server-rendered public link-tree page via `getPageByUsername`. Missing/invalid pages render the global 404 page. Cached via `unstable_cache`.
- `/actions/revalidate.ts` — Server Action executing `revalidateTag('page-<username>', 'max')` post-save.

---

## Git Repository State (WIP context)
- **Current branch:** `8726`
- **Current Focus:** Implementing public page caching with per-user cache invalidation. `unstable_cache` is being added to `/[username]/page.tsx`, and `PageEditorProvider.tsx` now calls `revalidatePage()` upon successful manual save.

---

## Key Core Rules for AI Agents
1. **Adding New Fields:** Always register new fields in 3 places: `types.ts`, `normalizePageDocument()` (with default values), and `buildPageUpdate()`.
2. **Image Handling:** All images must run through compressor modules before saving. ALWAYS use delta updates (`buildPageUpdate`) to preserve bandwidth and payload limits.
3. **Firebase Runtime:** Firebase client SDK handles data fetching. Public page reads occur client-side or server-side via open read rules.
4. **Cache Management:** Public pages are cached using `unstable_cache`. Every successful save in the editor **must** execute `revalidatePage(username)`.
5. **Next.js Documentation Check:** Prior to modifying Next.js API features or configuration, always check local guides in `node_modules/next/dist/docs/`.
