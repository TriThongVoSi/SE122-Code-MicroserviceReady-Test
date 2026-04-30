# Profile UI Redesign — Design Spec

**Date:** 2026-05-01
**Scope:** Visual redesign of the three role-based profile pages (buyer, farmer, admin) — `BuyerProfile.tsx`, `FarmerProfile.tsx`, `AdminProfile.tsx`.
**Type:** UI-only refactor. No API, route, hook, or data-shape changes.

## Goal

Modernize the profile UI to feel premium, clean, and user-friendly with stronger visual hierarchy and a consistent visual language across all three roles. Preserve every existing data point, button, hook call, and translation key.

## Non-goals

- No new fields, no new actions, no new API calls.
- No restructuring of routes, types, or queries.
- No changes to the EditProfileDialog component (out of scope).
- No mobile-first redesign — current responsive breakpoints are retained, with refinements where the new layout requires them.

## Affected files

- `src/features/buyer/profile/components/BuyerProfile.tsx`
- `src/features/farmer/profile/components/FarmerProfile.tsx`
- `src/features/admin/profile/components/AdminProfile.tsx`
- Locale strings (`vi`, `en`) — only if any *new* small subtitle strings are added (e.g., card subtitles); no existing keys are removed or renamed.

## Visual structure (applies to all three roles)

### Page header (unchanged)

- Left: page title (existing `t('profile.title')` for farmer/admin, hard-coded `Hồ sơ của tôi` for buyer — kept as-is) plus optional refresh spinner when `isFetching`.
- Right: existing "Chỉnh sửa hồ sơ" button (emerald primary, User icon, opens EditProfileDialog). Unchanged.

### Hero card (new visual treatment)

A single rounded card containing three vertically stacked zones.

**Zone A — Banner (~140px tall)**

- Soft emerald gradient (`from-emerald-500 via-emerald-600 to-teal-600`) as the background.
- Decorative low-opacity overlay (SVG dot grid or radial blur shapes) for texture.
- No text on the banner itself — purely a visual signature for the page.

**Zone B — Identity row (overlaps the banner edge)**

- Avatar: 96–112px, white ring (`ring-4 ring-white`) and soft shadow, sits halfway over the banner's bottom edge on the left.
- To the right of the avatar (aligned to the bottom of the banner / top of the body):
  - Display name in `text-2xl font-bold tracking-tight`.
  - `@username` in muted small text directly below.
  - On the next line: role badge + status badge using the same Lucide icons and labels currently in use (`ShoppingBag` + "Người mua" for buyer, `Sprout` + "Nông dân" for farmer, `Shield` + "Quản trị" for admin; status badge unchanged).
- The page-header edit button is the canonical location for the edit affordance — it is **not** duplicated inside the hero card.

**Zone C — Stat tile strip (below identity, inside the same card)**

- 3-column grid of soft-tinted tiles. Each tile contains an icon chip on the left and a label/value pair on the right.
  - **User ID** — slate-tinted tile (`bg-slate-50`), `User` icon chip, value `#{id}` in mono.
  - **Joined Date** — emerald-tinted tile (`bg-emerald-50`), `Calendar` icon chip, formatted joined date.
  - **Last Login** — sky-tinted tile (`bg-sky-50`), `Clock` icon chip, value or fallback string.
- Each tile: `rounded-2xl`, 1px subtle border matching the tint family, icon inside a white-on-tint circular chip, tiny uppercase label, value in `text-base font-semibold`.
- Mobile: collapses to 1 column.

### Contact information card

Quieter card to balance the hero above.

- **Header row:** Mail icon in a small emerald-tinted rounded-xl chip (~32px), title "Thông tin liên hệ" in `text-base font-semibold`, optional muted subtitle ("Cách liên lạc với bạn" or i18n equivalent).
- **Body — 2-column grid (collapses to 1 on mobile):**
  - Email and Phone share the top row.
  - Address spans full width on its own row below (long values render better at full width).
  - Each field: tiny uppercase label, small icon in a soft circular chip (`bg-slate-100`, ~24px), value in `text-base text-slate-900` (mono retained for phone).
  - `AddressDisplay` component used as today (same `wardCode` and `fallback` props).

### Farmer & admin extra cards

The Farm Overview (farmer), Recent Activity (farmer + admin), and Notification Preferences (farmer + admin) cards keep their internal content (same stats, same activities, same switches, same i18n keys). They receive the same header treatment as the contact card:

- Icon chip (rounded-xl, tinted) + title + muted subtitle.
- Matching card padding (`p-6 sm:p-8`) and `rounded-2xl` corners.
- Same `space-y-6` rhythm between cards.

### Page background & rhythm

- Page background upgraded from flat `bg-gray-50` to a subtle vertical wash: `bg-gradient-to-b from-slate-50 to-white`.
- Cards use a slightly stronger lift shadow: `shadow-sm` is replaced by a custom layered shadow (small inset + a soft tinted drop, e.g. `shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(16,185,129,0.08)]`).
- Max-width retained per role (buyer `max-w-4xl`, farmer/admin `max-w-[1280px]`).

## Behavior preservation (must remain unchanged)

- All hook calls: `useProfileMe`, `useAuth`, `useFarms`, `usePlots`, `useSeasons` (where applicable).
- All `useMemo` data shaping for `profileData`, `farmStats`, `recentActivities`.
- All loading states: full-page loader when `profileLoading && !hasSessionProfile`; subtle spinner beside the title when `isFetching && !profileLoading`.
- EditProfileDialog open/close state and props.
- All translation keys (`profile.title`, `profile.editProfile`, `profile.userId`, `profile.joinedDate`, `profile.lastLogin`, `profile.contactInfo.*`, `profile.farmOverview.*`, `profile.recentActivity.*`, `profile.notifications.*`, `admin.profile.*`).
- Notification toggle state and handlers (farmer + admin).
- Routing and props are not touched.

## New translation keys (additions only, no removals)

If we add card subtitles (optional polish), they will be additive keys such as:

- `profile.contactInfo.subtitle`
- `profile.farmOverview.subtitle`
- `profile.recentActivity.subtitle`
- `profile.notifications.subtitle`

These are optional. If we choose not to add subtitles, no locale changes are required.

## Component decomposition

To keep each profile component focused and to share the hero treatment across all three roles, extract two presentational components:

- `src/features/<role>/profile/components/parts/ProfileHeroCard.tsx` — receives display name, username, avatar initials, role badge config (icon + label), status, and the three meta-stats (id, joined date, last login). Renders banner + identity + stat strip.
- `src/features/<role>/profile/components/parts/ContactInfoCard.tsx` — receives email, phone, address fields and renders the redesigned contact card.

Decision: place these in a shared location to avoid duplication across three role folders.

- New shared location: `src/features/shared/profile/parts/` (or `src/widgets/profile/` if that better matches existing conventions; the implementation plan will confirm). Both `ProfileHeroCard` and `ContactInfoCard` are role-agnostic — role-specific bits (badge icon + label) are passed in as props.

The role-specific files (BuyerProfile, FarmerProfile, AdminProfile) shrink to: data assembly + role-specific badge config + the shared hero/contact components + role-specific extra cards.

## Open questions deferred to plan

- Exact decorative pattern for the hero banner (dot grid SVG vs. radial blur shapes) — to be decided during implementation, with a quick visual check.
- Whether to add card subtitles — defaults to "no" unless we see clear value during implementation.
- Final shared-component path (`src/features/shared/profile/parts/` vs. `src/widgets/profile/`) — confirmed in the plan after re-checking existing convention.

## Acceptance criteria

1. Buyer, farmer, and admin profile pages render with the new hero card (banner + overlapping avatar + stat strip).
2. Contact card uses the new chip-icon header and the email/phone/address layout.
3. Farmer extra cards (Farm Overview, Recent Activity, Notifications) and admin extra cards (Recent Activity, Notifications) use the matching header treatment.
4. Every existing data point and button visible in the current screenshots is still present and functional.
5. EditProfileDialog opens from the page-header button and saves successfully end-to-end.
6. Loading states (full-page loader, subtle refresh spinner) behave identically to today.
7. No regressions in i18n: all current Vietnamese and English strings still appear correctly; no missing-key warnings in the console.
8. No TypeScript errors; type-check passes.
9. Manual visual check at desktop and mobile widths confirms the responsive collapse behavior described above.
