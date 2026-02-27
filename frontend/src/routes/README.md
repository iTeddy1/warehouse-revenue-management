This folder uses TanStack Router v1 file-based routing. The plugin generates `routeTree.gen.ts` at the root of `src` during dev/build.

Structure:

- `__root.tsx` — Root layout (sidebar + header) and `<Outlet />` for pages
- `index.tsx` — Home page
- `projects.tsx`, `payment.tsx`, `reports.tsx`, `setting.tsx`, `backup.tsx` — Placeholder pages
- `__not-found.tsx` — 404 route

Tips:

- Routes are discovered by file name. For nested layouts, create folders and `__layout.tsx` files.
