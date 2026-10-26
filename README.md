# Project Camp

> A collaborative expedition management platform designed around route planning, waypoints, and team momentum. Built with React 19, TypeScript, Tailwind CSS, TanStack Query, Framer Motion, Three.js, GSAP, and @dnd-kit.

---

## 1. Product & Design Philosophy

Project Camp treats collaborative product engineering and creative workflows as an organized expedition from base camp to summit. Tasks are marked waypoints along a shared route, elevation profiles track momentum without vanity charts, and shared notes document field findings.

### Semantic Design System & Tokens
- **Canvas Neutrals**: Crisp mineral snow (`#F8FAF9`) in light mode; granite shelter bivouac (`#0E1513` / `#141E1A`) in dark mode.
- **Primary & Contrast**: Deep expedition evergreen (`#1C382F` light / `#3B7E67` dark) with pure white contrast.
- **Accent**: Survey beacon amber (`#D97706` light / `#F59E0B` dark) highlighting critical paths and focused states.
- **Typography**: `Plus Jakarta Sans` for geometric display headings; `DM Sans` for UI and body prose; `JetBrains Mono` with `tabular-nums` for coordinates, dates, and metrics.
- **Zero-Pill Discipline**: Metadata is rendered as clean unboxed text separated by typographic dots (`·`), reserving bordered buttons strictly for active interactive controls.
- **Signature Element**: **The Expedition Route Line** (`RouteProgress`), a segmented vector track that illuminates as tasks are completed, accompanied by the lightweight in-app 3D **Project Terrain Accent**.

---

## 2. Tech Stack

- **Framework**: React 19, Vite 8, React Router v6
- **Server State**: TanStack Query v5 with optimistic mutations and automatic rollback
- **Forms & Validation**: React Hook Form + Zod
- **Drag & Drop**: `@dnd-kit/core` & `@dnd-kit/sortable` with keyboard alternatives
- **3D & Visuals**: Three.js, `@react-three/fiber`, custom GLSL contour shader, and InstancedMesh
- **Storytelling Motion**: GSAP ScrollTrigger + Lenis smooth scroll
- **Toasts & Feedback**: Sonner
- **Testing**: Vitest + Testing Library + jsdom

---

## 3. Setup and Run Steps

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd project-camp

# Install all dependencies
npm install

# Configure environment variables
cp .env.example .env
```

### Environment Configuration (`.env`)
```bash
# Backend REST contract URL (defaults to /api/v1)
VITE_API_URL="/api/v1"

# Target backend server for dev proxy in vite.config.ts (default http://localhost:8000)
VITE_BACKEND_URL="http://localhost:8000"
```

### Running Locally
```bash
# Start development server on port 3000
npm run dev

# Run unit and integration tests (Vitest)
npm test

# Type-check and lint codebase
npm run lint

# Build production bundle
npm run build
```

---

## 4. Backend Contract & Integration Reference

All authentication is handled via `httpOnly` secure cookies with `credentials: 'include'` on every request. Tokens are never stored in `localStorage` or `sessionStorage`.

On any `401 Unauthorized` response from a protected route, `src/api/client.ts` automatically executes a single, deduplicated `POST /auth/refresh-token` call. Concurrent 401s share this single promise lock. If the token refresh succeeds, all stalled requests are retried. If the refresh fails, a global `AUTH_EVENTS.SESSION_EXPIRED` event is dispatched, clearing state and redirecting the user to `/login?expired=1`.

---

## 5. Architectural Assumptions Catalog (`src/api/adapters.ts`)

All assumptions regarding response shapes and field names have been isolated in `src/api/adapters.ts`:

1. **User Identifier**: Assumes user ID can be returned as `id`, `_id`, or `userId`.
2. **Project List Wrapper**: Assumes `GET /projects` can return an array of flat project objects or objects wrapped in `{ project: { ... }, role: 'admin' }`.
3. **Project Role Fallback**: If the backend does not return `role` or `currentUserRole` in a project object, defaults gracefully to `'member'`.
4. **Member Count**: Assumes `memberCount` is provided directly or derived from `members.length`, falling back to `1`.
5. **Task Status Normalization**: Normalizes varied status formats (`todo`, `TODO`, `in_progress`, `ongoing`, `done`, `completed`) into canonical `'todo' | 'in_progress' | 'done'`.
6. **Assignee Populating**: Assumes `assignedTo` can be an ID string or an embedded `{ _id, username, email }` user object.
7. **Subtask Completion**: Supports both boolean `isCompleted` and legacy boolean `completed` or `status === 'done'`.
8. **Attachment Schema**: Maps `{ id, name, originalname, filename, url, path, size, mimetype }` into a consistent `Attachment` structure.

---

## 6. Unverified Aspects

1. **Live Remote SMTP Delivery**: Email delivery verification (`POST /auth/register`, `POST /auth/resend-email-verification`, `POST /auth/forgot-password`) was tested with client contract handlers and mocked responses; live inbox delivery depends on external mail server configuration.
2. **High-Concurrency Real-Time Collisions**: Task drag-and-drop utilizes optimistic local updates with rollback on mutation errors; concurrent edits from multiple users simultaneously rely on polling or cache invalidation since WebSockets are not specified in the REST contract.

---

## 7. Backend Gaps & Recommended Improvements

1. **Missing Subtask Batch or Task Aggregate Statistics Endpoint**:
   - *Current Gap*: The client must calculate route progress and waypoint percentages by iterating through full task arrays.
   - *Recommendation*: Introduce `GET /projects/:projectId/stats` returning `{ totalTasks, completedTasks, inProgressTasks, memberCount }` to avoid transferring full task payloads on overview screens.
2. **Separate Subtask Listing Route**:
   - *Current Gap*: Subtasks can only be modified individually or retrieved embedded inside task objects.
   - *Recommendation*: Add `GET /tasks/:projectId/t/:taskId/subtasks` for lightweight subtask polling.
3. **Activity Audit Log / Event Feed**:
   - *Current Gap*: No endpoint currently tracks who moved a task or who uploaded an attachment.
   - *Recommendation*: Add `GET /projects/:projectId/activity` to support expedition timeline audits.
4. **Multipart Response Normalization**:
   - *Current Gap*: Some backends return multipart responses with different file URL protocols (local relative vs S3/GCS signed URLs).
   - *Recommendation*: Ensure `url` in attachment payloads returns a fully-qualified CDN or signed download URL.
