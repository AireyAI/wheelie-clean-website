# ARTERIA — Account Onboarding Wizard
Date: 2026-04-10

## Overview
After a user creates an account, they are walked through a 4-step onboarding wizard. The wizard slides up as a panel (consistent with the existing login panel and booking modal), collects essential profile data, then closes and lands the user on the homepage with a success toast.

## Trigger
The wizard launches automatically after `handleAuth()` completes in signup mode. It replaces the current "Account created!" success screen inside `loginContent`.

## Layout
- Slide-up panel, identical structure to the existing `.booking-panel`
- Progress bar across the top (4 segments, amber fill advancing each step)
- Step label: "Step N of 4" in small uppercase
- Back button on steps 2–4; Continue / Finish CTA at the bottom
- Closing the panel mid-wizard is allowed (✕ button); state is discarded

## Steps

### Step 1 — Account Type
- Heading: "What brings you here?"
- Two large tile buttons: Creator (🎨) and Advertiser (🏢)
- Selecting a tile highlights it with amber border; tapping Continue advances
- Creator subtitle: "Artist · musician · photographer · dancer…"
- Advertiser subtitle: "Brand · studio · venue owner…"

### Step 2 — Profile
- Heading: "Set up your profile"
- Avatar upload: circular tap target with camera icon, accepts JPG/PNG, previews inline
- Display name field (required — Continue is disabled until filled)
- Short bio textarea (optional, max 160 chars with live counter)

### Step 3 — Creative Disciplines
- Heading: "What do you create?"
- Subheading: "Pick all that apply"
- Pill toggles (multi-select): Music, Photography, Dance, Film, Visual Art, Podcast, Theatre, Writing
- Selected pills use amber fill + border; unselected are dim
- Minimum 1 selection required to Continue
- Only shown when account type is Creator; Advertiser skips to step 4

### Step 4 — Location
- Heading: "Where are you based?"
- Single text input: city name (e.g. London, Berlin)
- Skip link below input: "Skip — I'll add this later"
- CTA: "Finish — Enter ARTERIA ✦"

## Completion
1. Wizard panel closes with slide-down transition
2. Login overlay fades out
3. Toast fires: "Welcome to ARTERIA, [display name] ✦"
4. User stays on current view (homepage)
5. Profile data stored in `localStorage` under `arteria_profile` (same pattern as `arteria_favs`)

## Data Model
```js
arteria_profile = {
  type: 'creator' | 'advertiser',
  name: string,
  bio: string,           // optional
  avatar: string,        // data URL or empty
  disciplines: string[], // empty for advertisers
  city: string           // optional
}
```

## Advertiser Variation
- Step 3 is replaced with: **"What type of business are you?"**
  - Pill options (single-select): Recording Studio, Photography Studio, Venue / Event Space, Brand / Agency, Equipment Rental, Other
  - Heading: "What type of business are you?"
  - Subheading: "Helps us connect you with the right creators"
  - 1 selection required to Continue
- Step 2 bio placeholder changes to "Describe your brand or business"
- Finish toast: "Welcome to ARTERIA, [name] — your advertiser account is ready."
- Data stored as `businessType: string` on the profile object

## Tech
- Single HTML file, no backend
- All data stored in localStorage
- Wizard state managed in a plain JS object, reset on close
- Re-uses existing CSS variables, `.booking-panel`, `.field-input`, `.btn-cta` classes
- New CSS only where needed (pill toggles, avatar preview)
