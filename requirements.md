# MediStock PWA: Minimal MVP Requirements

## 1. Project Overview
A simplified, mobile-first inventory tracker for shared medical supplies. Focused on speed of development and core utility.

## 2. Core Tech Stack
- **Frontend:** React (Vite) + Tailwind CSS + Lucide Icons
- **Backend/Auth:** Supabase (PostgreSQL + Google OAuth)
- **Deployment:** Vercel (PWA enabled)

## 2a. Design Vision
- **Professional experience:** The product should feel like a polished modern workspace, not just a collection of forms.
- **Clear hierarchy:** Dashboard overview, inventory browser, and detailed workspace sections should be visually distinct.
- **Responsive layout:** Desktop and mobile should both feel intentional, with cards, status chips, and streamlined interactions.
- **Brand polish:** Auth and onboarding screens should reflect a premium product experience.

## 3. Database Schema (Supabase)
### profiles
- `id` (uuid, references auth.users)
- `email` (text)

### inventories
- `id` (uuid, primary key)
- `name` (text)
- `invite_code` (text, unique) - Simple string for instant joining.

### inventory_members
- `inventory_id` (uuid, fk)
- `user_id` (uuid, fk)

### medicines
- `id` (uuid, primary key)
- `inventory_id` (uuid, fk)
- `name` (text)
- `category` (text) - e.g., 'Pill', 'Syrup', 'First Aid'
- `quantity` (int)
- `threshold` (int) - The "Low Stock" trigger level.
- `expiry_date` (date, optional)

## 4. Key Features (MVP Scope)
### A. Instant Collaboration
- Users join an inventory by entering a unique `invite_code` for instant access.
- Users can also request membership by submitting an inventory ID; owners review pending requests using the approval dashboard.
- The app should surface both instant join and owner-managed membership flows clearly.

### B. Stock Tracking
- Simple list view of medicines.
- **Visual Status Logic:**
    - **CRITICAL:** `quantity == 0` (Red)
    - **LOW:** `quantity <= threshold` (Yellow)
    - **OK:** `quantity > threshold` (Green)
- Quick-action buttons: `[ + ]` and `[ - ]` to adjust quantity from the dashboard.

### C. Automated Shopping List
- A dedicated view that displays all items where `quantity <= threshold`.
- No separate table needed; just a filtered query of the `medicines` table.

### D. Premium Product Experience
- Modern dashboard overview with summary cards and attention indicators.
- Polished inventory browser with status chips, hover states, and clear action affordances.
- Workspace-style inventory detail pages with visually distinct sections for medicines, shopping, and membership.
- Auth and onboarding flows that feel premium and consistent with the product brand.
- Maintain fast, accessible interactions without adding heavy UI frameworks.

### E. PWA Support
- Offline view capability.
- "Add to Home Screen" shortcut.

### F. Email/Password Authentication
- Users can register with email and password (in addition to Google OAuth).
- Unified login screen supporting both authentication methods.
- Password recovery flow so users can request a reset email if they forget their password.
- Sign-out button in dashboard header for easy session termination.
- Inventory access is driven by join method: invite code grants instant access, inventory ID join requests require owner approval.

### G. Inventory Ownership and Lifecycle
- Inventory owners can remove approved members from their inventory.
- Inventory owners can delete an inventory and all associated membership and medicine data.
- Approved members can leave an inventory on their own.

## 5. Implementation Roadmap
1. **Setup:** Supabase project + Vite/Tailwind boilerplate.
2. **Auth Phase 1:** Google OAuth login + user profile creation.
3. **Inventory:** Create inventory and "Join by Code" logic.
4. **Medicines:** Basic CRUD for adding/editing medicine items.
5. **Dashboard:** Status-colored list with quick +/- buttons.
6. **Shopping:** Filtered "Shopping List" view.
7. **UI Polish:** Refine inventory detail pages, sign-in experience, and responsive layout for a pro-grade product feel.
8. **Auth Phase 2:** Email/password registration, sign-in, and sign-out UI.
9. **PWA:** Manifest and Service Worker via `vite-plugin-pwa`.