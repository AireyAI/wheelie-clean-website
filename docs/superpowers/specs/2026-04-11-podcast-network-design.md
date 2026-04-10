# ARTERIA — Podcast Network
Date: 2026-04-11

## Overview
A matchmaking board inside ARTERIA where podcasters can advertise their show to attract guests, and individuals can advertise themselves as available podcast guests. Both sides see each other's contact info directly — no backend messaging needed.

## Trigger / Entry Points
- New nav link "Podcast" added to `.nav-links`
- Clicking the "Podcast / Video" category card on the homepage navigates to this view
- `handleRoute()` extended to handle `data-view="podcast-network"`

## View Structure

### Header
- View heading: "Podcast Network"
- Subheading: "Connect with podcasters and guests across the creative world"
- Amber "Post a listing" button (top right) — opens the post modal

### Tabs
Two tab buttons below the header:
- **Find a Guest** (default active) — shows Host cards
- **Be a Guest** — shows Guest cards

Tab state stored in a JS variable (`podTab`). Switching tabs re-renders the cards grid.

### Cards Grid
CSS grid, same `.listing-grid` class pattern as existing explore view. Two card types:

#### Host Card (Find a Guest tab)
```
[ Cover art image ]
Show name           • niche tags (Music, Culture…)
Host name · Location
Episode count
Short description (2–3 lines, truncated)
[ Contact Host → ] (links to host's contact URL)
```

#### Guest Card (Be a Guest tab)
```
[ Avatar ]
Name · Location
Expertise tags
Short pitch (2–3 lines)
Previous appearances (optional, italic)
[ Invite to Show → ] (links to guest's contact URL)
```

## Post a Listing Modal

Slide-up panel (`.booking-panel` pattern), triggered by "Post a listing" button.

Two modes selected at the top of the panel: **I'm a Host** | **I'm a Guest**

### Host fields
| Field | Required | Notes |
|---|---|---|
| Show name | Yes | text input |
| Niche | Yes | pill multi-select: Music, Tech, Culture, Comedy, Sport, Business, Health, Other |
| Episodes so far | No | number input |
| Description | Yes | textarea, max 200 chars |
| Contact link | Yes | URL or @handle (Instagram, Twitter, email) |

### Guest fields
| Field | Required | Notes |
|---|---|---|
| Your name | Yes | text input |
| Expertise | Yes | pill multi-select: same tags as host niche |
| Your pitch | Yes | textarea, max 200 chars |
| Previous appearances | No | text input, e.g. "The Creative Hour, Ep 44" |
| Contact link | Yes | URL or @handle |

On submit: saves to `localStorage` key `arteria_podcast_listings` (array). New listings are prepended to the relevant tab with an amber "New" badge. Panel closes after save.

## Data Model

### Hardcoded seed data (hosts)
```js
[
  { id: 'h1', type: 'host', show: 'The Creative Hour', host: 'Marcus T.', loc: 'London', niche: ['Music','Culture'], episodes: 142, desc: 'Weekly deep-dives with musicians, producers, and visual artists about the business and craft of creativity.', contact: 'instagram.com/thecreativehour', img: '600x400' },
  { id: 'h2', type: 'host', show: 'Frequency', host: 'Aisha M.', loc: 'Berlin', niche: ['Tech','Music'], episodes: 67, desc: 'Exploring the intersection of technology and sound design. Looking for producers, engineers, and innovators.', contact: 'twitter.com/frequencypod', img: '600x400' },
  { id: 'h3', type: 'host', show: 'Studio Sessions', host: 'Pedro R.', loc: 'Lisbon', niche: ['Music','Business'], episodes: 28, desc: 'Conversations with independent artists about building a sustainable career without a label.', contact: 'studiosessionspod@gmail.com', img: '600x400' },
  { id: 'h4', type: 'host', show: 'Lens & Light', host: 'Yuki S.', loc: 'Paris', niche: ['Culture','Other'], episodes: 91, desc: 'A photography and visual art podcast. Seeking photographers, directors, and visual storytellers.', contact: 'instagram.com/lensandlightpod', img: '600x400' },
]
```

### Hardcoded seed data (guests)
```js
[
  { id: 'g1', type: 'guest', name: 'Diane C.', loc: 'Amsterdam', expertise: ['Music','Business'], pitch: 'Music manager with 10 years in the industry. Happy to talk A&R, sync licensing, or artist development.', appearances: 'The Business of Music, Ep 12', contact: 'instagram.com/dianec_music' },
  { id: 'g2', type: 'guest', name: 'Olu A.', loc: 'London', expertise: ['Tech','Music'], pitch: 'Audio software engineer and producer. Can speak on DAWs, plugin development, and electronic music production.', appearances: '', contact: 'twitter.com/oluaudio' },
  { id: 'g3', type: 'guest', name: 'Cleo B.', loc: 'Barcelona', expertise: ['Culture','Health'], pitch: 'Dance artist and wellbeing coach. I talk about the mental health side of life as a performing artist.', appearances: 'Move Well Podcast, Ep 5', contact: 'cleobarnes.com' },
  { id: 'g4', type: 'guest', name: 'James W.', loc: 'Berlin', expertise: ['Business','Other'], pitch: 'Independent label founder. Three years running a Berlin-based electronic music label. Happy to talk DIY releasing.', appearances: 'The Label Life, Ep 3 & Ep 19', contact: 'instagram.com/jameswlabel' },
]
```

### localStorage schema
```js
arteria_podcast_listings = [
  // same shape as seed data above, isNew: true added on user-created entries
]
```

## Tech
- Single HTML file, no backend
- All data in localStorage, seeded on first load if key absent
- View rendered by a `renderPodcastNetwork()` function, called from `handleRoute()`
- Tab switching calls `renderPodcastCards(tab)` which re-renders just the grid
- Modal follows existing `.booking-panel` / `.overlay` pattern
- Reuses existing CSS variables and card styles; new CSS only for podcast-specific elements (tab buttons, niche pills on cards)
- "New" badge: amber dot + "New" label, shown when `isNew: true` on a listing

## Navigation
- `go('podcast-network')` navigates to the view
- `goExploreType('Podcast Studio')` continues to go to the spaces explore view (unchanged)
- Nav link added: `<li><a onclick="go('podcast-network')">Podcast</a></li>`
