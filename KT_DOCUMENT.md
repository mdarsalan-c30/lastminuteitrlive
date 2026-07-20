# LastminuteITR - Knowledge Transfer (KT) Document

Welcome to the LastminuteITR project! This document serves as a comprehensive Knowledge Transfer guide to help new developers understand the architecture, tech stack, folder structure, and deployment processes of the platform.

---

## 1. Tech Stack Overview

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **State Management:** Zustand (e.g., `useProfileStore` for user session/profile data)
- **Icons:** Lucide React
- **Components:** Modular component architecture separating marketing pages and application (filing) pages.

### Backend
- **Framework:** Python (FastAPI)
- **Server:** Uvicorn (running on port 5000)
- **Endpoints:** Handles complex compute tasks (e.g., `/api/compute`), AI summaries, and potentially document parsing logic.

### Database & ORM
- **ORM:** Prisma Client (v5.22.0)
- **Schema:** Defined in `prisma/schema.prisma`

---

## 2. Architecture & Folder Structure

The project is structured into distinct areas to separate the marketing landing pages from the core tax filing application logic.

```text
frontend/
├── app/
│   ├── (marketing)/       # Public-facing landing pages, blogs, privacy policy
│   ├── (app)/             # The core tax filing application (requires authentication/session)
│   │   └── file/          # Routes for dashboard, profile, import documents, checkout, etc.
│   ├── api/               # Next.js API routes (e.g., auth, basic fetching)
│   └── layout.tsx         # Root layout
├── components/
│   ├── brand/             # Brand assets (e.g., BrandLogo.tsx)
│   ├── filing/            # Components specific to the ITR filing flow (e.g., AI Companion)
│   ├── marketing/         # Landing page components (HeroSection, SiteHeader, SiteFooter)
│   └── ui/                # Reusable UI primitives (buttons, modals, sheets)
├── lib/                   # Utility functions, stores, constants, and pricing logic
│   ├── store/             # Zustand state stores (e.g., profile.ts)
│   └── brand.ts           # Centralized brand configurations (logo paths, slogans)
├── public/
│   └── brand/             # Static assets (logos, icons)
└── prisma/                # Prisma schema and migrations
```

---

## 3. Key Components & Workflows

### Brand Logo Management
- Configured in `frontend/lib/brand.ts`.
- `BrandLogo.tsx` (in `components/brand/`) handles rendering different variants:
  - `variant="full"`: Renders the complete logo image (`lastminuteitr-logo.png`).
  - `variant="wordmark"`: Renders the icon image (`lastminuteitr-icon.png`) alongside hardcoded text.
  - `variant="icon"`: Renders just the icon image.

### Tax Filing Flow
- Users navigate through the `app/(app)/file/*` directory.
- Profile page (`app/(app)/file/profile/page.tsx`) displays user details, current filing status, and account settings. Dummy/mock data was recently removed in favor of empty states until backend integration is finalized.

---

## 4. Deployment Process

The application is deployed on a VPS running **PM2** for process management and **Nginx** as a reverse proxy.

### PM2 Processes
The VPS runs two primary PM2 processes:
1. **frontend**: The Next.js production server (running on port `3000`).
2. **backend**: The Python FastAPI Uvicorn server (running on port `5000`).

### Automated Deployment Scripts
We use custom Python deployment scripts to manage updates cleanly:
- `deploy_vps_git_clean.py`: Stashes/cleans local changes, pulls the latest `main` branch from GitHub, regenerates the Prisma client, runs `next build`, and restarts the frontend PM2 process.
- `diagnose_vps.py`: Checks the status of PM2 processes, verifies listening ports, and outputs the latest logs for both backend and frontend to debug crashes (like 502 Bad Gateway errors).

### Manual Deployment Steps (If needed)
If you need to deploy manually via SSH:
1. Pull the latest code: `git pull origin main`
2. Install dependencies (if changed): `npm install`
3. Generate Prisma client: `npx prisma generate`
4. Build Next.js: `npm run build`
5. Restart PM2: `pm2 restart frontend`

---

## 5. Common Issues & Troubleshooting

- **502 Bad Gateway:** This usually means the Next.js frontend PM2 process has crashed. 
  - *Fix:* Check PM2 logs using `pm2 logs frontend`. Common causes include missing imports causing a build failure, or the `.next` directory missing because a build didn't complete successfully.
- **Logo not updating in Header/Footer:** Ensure the `BrandLogo` variant in `SiteHeader.tsx` and `SiteFooter.tsx` aligns with the image assets in `public/brand/`. If using `variant="wordmark"`, you must update `lastminuteitr-icon.png` specifically.
- **Python Unicode Errors:** Occasionally, deployment scripts might throw a Unicode encode error when reading checkmarks from the `next build` output. This doesn't affect the actual build success, but it may interrupt the Python wrapper script.

---

## 6. Next Steps for Development

- **Backend Integration:** The "Tax Filing History" and "Invoice History" on the Profile page are currently showing empty states. The next major step is integrating these with actual database queries via Prisma or the FastAPI backend.
- **AI Companion Setup:** Ensure the FastAPI backend is correctly integrated with the `ActiveAiCompanion.tsx` component to handle smart tax queries.
