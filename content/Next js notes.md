---
title: next.js notes
tags:
  - javascript
  - react
  - nextjs
  - web-development
---

← [[index]]

# Next.js Notes

## Commands
- Create new next.js project `npx create-next-app@canary < app name >`
- Run `npm run dev`
- **`app/`**: The main directory for your application code using the App Router
    - **`page.tsx`**: Defines the UI for a route
    - **`layout.tsx`**: Shared UI wrapper for a segment and its children
    - **`loading.tsx`**: Loading UI for a segment
    - **`error.tsx`**: Error handling UI for a segment
    - **`not-found.tsx`**: 404 UI for a segment
- **`app/api/`**: API routes for creating endpoints
    - Example: `app/api/users/route.ts`
- **`public/`**: Static assets like images, fonts, and files
    - Served at the root path (e.g., `/logo.svg`)
    - Not processed by the build system