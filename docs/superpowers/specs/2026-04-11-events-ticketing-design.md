# ARTERIA — Events Ticketing & Create Event
Date: 2026-04-11

## Overview
Upgrade the Events view with two features: a fake checkout ticket flow (name, email, qty, price breakdown, confirm) and a "Create Event" panel for users to post their own events. No backend — all data stored in localStorage.

## Entry Points
- Events view (`data-view="events"`) is the only affected view
- Reached via `go('events')` from nav, homepage cards, and footer

## Events Page Header Changes
- Add amber "Create Event" button to the section header (top right), same pattern as "Post a listing" on Podcast Network
- Calls `openCreateEventModal()`

## Event Cards — Get Tickets Button
Replace the current "Join" button (which fires a dead toast) with:
- **Paid events** (`ev.price > 0`): "Get Tickets →" button → calls `openTicketPanel(ev.id)`
- **Free events** (`ev.price === 0`): "Reserve Free Spot" button → calls `openTicketPanel(ev.id)`
- The card `onclick` (currently also fires a toast) should be removed or neutralised — clicking the card should no longer trigger anything; only the button opens the panel

## Ticket Checkout Panel

Slide-up `.booking-panel` pattern, triggered by `openTicketPanel(id)`.

### Header
- Event title (truncated to 1 line)
- Date and location in small text below

### Body
- **Ticket qty stepper**: "−" button, number display (1–10, min 1, max capped at `ev.capacity`), "+" button
- **Price breakdown box** (`.price-breakdown` class, reused from booking panel):
  - Row: "Ticket × N" → "£X"
  - Row: "ARTERIA fee" → "£0" (free, shown for UX completeness)
  - Total row: "Total" → "£X"
- **Full name** field (`id="ticketName"`, required)
- **Email** field (`id="ticketEmail"`, type="email", required)
- **CTA button**: "Confirm & Pay £X" (updates dynamically as qty changes) — calls `confirmTicket()`
- Free events: CTA text is "Confirm Reservation" with no price

### On Confirm
1. Validate name and email (non-empty, email contains `@`)
2. Build ticket object, push to `arteria_tickets` in localStorage
3. Close panel
4. Fire toast: "You're going! 🎟 Check your email for details ✦"
5. Update the tickets badge count on the Events nav link

## Tickets Nav Badge
- Small amber badge on the "Events" nav link, same pattern as the favourites badge (`nav-badge` class)
- Shows total number of tickets purchased (count of entries in `arteria_tickets`)
- Hidden when count is 0, shown when > 0
- Badge element added to the Events `<li>` in the nav

## Create Event Panel

Slide-up `.booking-panel` pattern, triggered by `openCreateEventModal()`.

### Fields
| Field | Type | Required | Notes |
|---|---|---|---|
| Event title | text input | Yes | |
| Category | pill single-select | Yes | Workshop / Networking / Showcase / Retreat |
| Date | date input | Yes | |
| Location | text input | Yes | e.g. "Shoreditch, London" |
| Description | textarea | Yes | max 200 chars with live counter |
| Ticket price | number input | Yes | 0 = free |
| Capacity | number input | Yes | min 1 |

### On Submit
1. Validate all required fields
2. Derive `day` (DD) and `mon` (MMM) from the date input
3. Generate a unique id (`'u' + Date.now()`)
4. Save to `arteria_user_events` in localStorage (prepend)
5. Re-render the events grid (merged: user events first, then EVENTS_DATA)
6. Close panel
7. Fire toast: "Event listed! ✦"
8. New event card gets `isNew: true` → shows amber "New" badge (same as podcast network)

## Data Model

### User events (localStorage key: `arteria_user_events`)
```js
{
  id: string,           // 'u' + Date.now()
  cat: string,          // 'workshop' | 'networking' | 'showcase' | 'retreat'
  title: string,
  loc: string,
  date: string,         // ISO: '2026-07-15'
  day: string,          // '15'
  mon: string,          // 'JUL'
  price: number,        // 0 = free
  capacity: number,
  img: string,          // fixed placeholder seed e.g. 'arteria-user'
  type: string,         // same as cat
  desc: string,
  isNew: true
}
```

### Tickets (localStorage key: `arteria_tickets`)
```js
{
  eventId: string | number,
  eventTitle: string,
  name: string,
  email: string,
  qty: number,
  total: number,        // price * qty
  purchasedAt: string   // ISO date string
}
```

## renderEventsGrid Change
`renderEventsGrid` currently renders only `EVENTS_DATA`. Change it to:
```js
function getEventsData() {
  const stored = JSON.parse(localStorage.getItem('arteria_user_events') || '[]');
  return [...stored, ...EVENTS_DATA];
}
```
Use `getEventsData()` everywhere `EVENTS_DATA` is referenced in the events render/filter logic.

## Tech
- Single HTML file, no backend
- All new functions follow existing patterns in the codebase
- Reuses: `.booking-panel`, `.overlay`, `.booking-header`, `.booking-body`, `.booking-handle`, `.price-breakdown`, `.price-row`, `.modal-close`, `.field-input`, `.field-group`, `.btn-primary`
- New CSS only for: ticket qty stepper, "New" badge on event cards (`.ev-new-badge`), category pill select in create form (reuse `.pod-niche-pill` / `.pod-niche-pill.sel` pattern)
- Escape key handler extended with `closeTicketPanel()` and `closeCreateEventModal()`
