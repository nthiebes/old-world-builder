# OWR (Old World Rankings) Integration

Phased integration plan for connecting Old World Builder with Old World Rankings,
agreed between Colin (OWR) and Nico (OWB maintainer).

## Phase 1: Login

**Branch:** `feature/415-owr-oauth2-login`
**Upstream issue:** #415

Add OAuth2 Authorization Code + PKCE login with OWR as an alternative to Dropbox.
A single "Login" button in the header opens a dedicated login page (or dialog) where
users choose between Dropbox and OWR. The OWR option includes short upsell text
explaining the additional benefits (tournament integration, rankings, etc.).

### What's included
- OAuth2 PKCE flow: authorize → token exchange → refresh
- Provider tracking in Redux state (`provider: "owr" | "dropbox" | null`)
- Provider-aware logout (clears correct tokens)
- Guard on Dropbox `hasRedirectedFromAuth` so it doesn't consume OWR callbacks
- Login page/dialog with both provider options and OWR benefit description
- OWR scopes: `profile lists`

### What's NOT included (yet)
- No list sync — login only, no data is pushed or pulled
- No auto-sync via OWR

### Login UI direction (agreed with Nico)
- Single "Login" button in header (not two separate provider buttons)
- Opens a dedicated page or dialog with both options
- OWR option has room for context: what it is, why connect, what you get
- Nico may adjust UI styling after the technical PR lands

---

## Phase 2: Sync

Sync lists between OWB and OWR. The OWR sync engine will be **different and better**
than the Dropbox "push entire file" approach. Nico confirmed the two sync backends
can work differently — that's fine.

### Better sync engine (from tributech fork)
- Per-list `updated_at` timestamps — only sync changed lists
- Soft deletes — track deleted lists for 7-30 days to prevent resurrection
- Lexorank ordering — string-based ordering for drag-and-drop that survives
  partial syncs and filtered views
- `folder` field on lists
- `pinned_at` for pinning lists to top of folder

### Key design decisions
- Extra properties (lexorank, updated_at, folder, pinned_at) in list JSON are fine
  to add — Dropbox sync will simply ignore them
- Conflict resolution: same "use local" / "use remote" dialog as Dropbox
- OWR Pro could gate auto-sync; free users still get manual sync or submit-only
- Server-side: OWR stores lists in a JSON column (not flat file), so ordering
  must be explicit (hence lexorank)

### Naive sync vs soft-delete sync
The Dropbox sync pushes the entire list array. This has a known "zombie list" problem:

1. Device A deletes list Z, pushes `[X, Y]`
2. Device B still has `[X, Y, Z]`, edits Y, pushes `[X, Y', Z]`
3. Device A pulls — Z is back from the dead

The OWR sync tracks deletions server-side to prevent this.

---

## Phase 3: Tournament Integration

Submit army lists directly to tournaments from within the builder, and open
tournament lists back in the builder.

### Planned features
- "Submit to tournament" action on the export page
- Status indicator on lists (pending / approved by TO)
- Open any tournament list in the builder (deep link from OWR)
- Tournament-specific validation (comp rules applied)

### Where in the UI
- Export page is the natural home for tournament submission
- List view could show a small tournament icon with approval status

---

## Phase 4: Comp System

Custom army composition rules that tournament organisers can configure and
players can apply during list building.

### How it works
- Comp packs are selectable when creating a new list (e.g. Ozcomp, German comp)
- Comps layer additional validation on top of standard rules
- TOs select a comp when creating a tournament on OWR
- Validation extends the existing system: percentage overrides, unit limits,
  group limits with OR conditions, special rule restrictions

### Hosting
- Major comps (Ozcomp, German comp, etc.) are built-in / selectable
- Custom comps can be hosted on OWR — TO uploads files, gets a URL
- OWB loads comp data from URL (needs CORS-friendly hosting)
- Nico's existing "custom game system" feature covers full game rewrites
  (e.g. Renegade); comp system is lighter — just validation overlays

### Distinction from game systems
- **Game system** (Nico's existing feature): changes units, names, points —
  rewrites the game. Used for things like Renegade.
- **Comp pack** (this feature): layers restrictions on top of standard rules —
  limits, bans, point caps per category. Does not change unit data.
