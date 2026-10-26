# Project Camp — Design Brief

### 1. Design Philosophy
Project Camp treats collaborative work as an organized expedition from base camp to summit. Tasks are marked waypoints along a shared route, elevation profiles track momentum without vanity charts, and shared notes document field findings. Teams return to a calm, predictable station where clarity replaces chaos.

### 2. Semantic Palette (Light / Dark)
- Background: `#F8FAF9` / `#0E1513` (mineral snow / night bivouac)
- Surface: `#FFFFFF` / `#141E1A` (canvas / granite shelter)
- Surface-Raised: `#F0F4F2` / `#1A2823` (contour tier / terrace)
- Border: `#E1E8E5` / `#273A33` (hairline contour)
- Text: `#14221D` / `#ECF2EE` (granite pine / pale mist; >14:1 contrast)
- Text-Muted: `#5F7369` / `#8BA096` (spruce slate / sage; >5:1 contrast, WCAG AA)
- Primary: `#1C382F` / `#3B7E67` (expedition evergreen)
- Primary-Contrast: `#FFFFFF` / `#FFFFFF`
- Accent: `#D97706` / `#F59E0B` (survey beacon amber)
- Success: `#15803D` / `#22C55E` | Warning: `#B45309` / `#F59E0B` | Danger: `#B91C1C` / `#EF4444`
- Status: Todo `#475569` / `#94A3B8`, In Progress `#0284C7` / `#38BDF8`, Done `#15803D` / `#4ADE80`

### 3. Typography & Hierarchy
- Display / Headings: `Plus Jakarta Sans` (600/700, line-height 1.15-1.25, `clamp(1.5rem, 3vw, 2.5rem)`).
- UI / Body: `DM Sans` (400/500, line-height 1.5-1.6, max measure 68ch, sizes 13-16px).
- Data / Telemetry: `JetBrains Mono` (`tabular-nums`, 12-14px). No all-caps micro-eyebrows or isolated accent words.

### 4. Shape Language & Density
- Radii: Inputs/buttons `6px` (`rounded-sm`), cards/modals `8px` (`rounded-md`), nested chips `4px` (`rounded-xs`). Strict zero-pill rule for static metadata.
- Borders: 1px hairline (`border-border`). Elevation: single flat level with subtle ambient boundary (`shadow-xs`).
- Density: 4px spacing base. Comfortable mode (48px task rows, 16px padding) and Compact mode (36px rows, 8px padding).

### 5. Signature Element
- **The Expedition Route Line**: A segmented vector path running through project headers and task milestones that illuminates segment by segment with elevation node progress as tasks complete.

### 6. Audience Fit
- Students get immediate clarity and zero cognitive clutter through intuitive waypoints and clear roles.
- Startups gain high velocity via keyboard shortcuts (Cmd+K), instant filters, and snappy 200ms interactions.
- Enterprises receive trusted governance with strict project-level RBAC, audit-clean notes, and WCAG AA contrast.
