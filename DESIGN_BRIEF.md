# HH Goa 2026 — Builder House design brief

## The product in one line

**Builder House** is an identity studio, not a form with a frame pasted on it: one photo becomes an HH Goa Builder ID, a PFP frame, or a Crew Manifest that people actively want to post.

The feeling should be **“a collectible poster from the most intentional build station in India”** — warm, hand-made, sharp, social, and unmistakably Goa. It must not read as a corporate lanyard, generic cyberpunk UI, or an AI-generated tropical gradient.

## What must be designed

Design every state below at desktop and mobile widths. Mobile is the primary experience.

1. Landing / hero with a direct entry into the studio
2. Format choice: Builder ID, PFP Frame, Crew Manifest
3. Upload state, loaded-photo state, uploading/HEIC-converting state, unsupported/error state
4. Personalisation controls: name, role/stack, generated Builder Class, theme choice
5. Tactile crop/reposition state
6. Builder ID result and download/share state
7. PFP result with circular X safe-zone guide
8. Crew editor: self + up to three teammates, empty slot, full slot, remove state
9. Crew Manifest result
10. Share-to-X loading, successful hand-off, unavailable/error fallback
11. The short three-step “how it works” section

## Non-negotiable product behaviour

- No login, signup, wallet, waitlist, or social connection.
- JPG, PNG, WebP, and iPhone HEIC must be accepted.
- The initial crop must work for portrait, landscape, off-centre, and oddly-sized photos without asking the user to prepare it.
- Let people drag to reposition and scroll/pinch to zoom. This is an enhancement, not a prerequisite.
- Rendering should feel immediate. Use a tiny “COMPOSING” indicator only while a render is actually in progress.
- Download is a real high-resolution image file.
- Share to X must create a real previewable public card and pre-fill a post containing `#FrameInGoa`.
- Original photographs remain local. Explain that only the compressed final preview uploads after the visitor explicitly taps Share.
- The same studio must support a combined team frame. This is stated on the official task panel, not merely a bonus.

## Official visual anchor

Use official HH Goa references as the source of truth.

- Deep green: `#0B6839`
- Solar yellow: `#FEE101`
- Hot pink: `#FF0080`
- Warm paper: `#FFFBE8`
- Supporting cyan (used sparingly): `#4EC5D8`
- Display type: **Imbue** — editorial, expressive, heavy
- Utility type: **Victor Mono** — labels, timestamps, inputs, code-like metadata
- Use the official HH Goa lockup intact. Do not redraw or “modernize” it.

The surrounding image language is Goan print culture and an intentionally-made build station: ornamental arches, tile / textile rhythm, palms, houses, sun, beach shacks, painted signboards, photo windows, rope-hung frames, hand-drawn outlines. Keep the composition graphic and flat rather than literal or stock-photo tropical.

Useful official references:

- `https://hhgoa.com/`
- `https://hhgoa.com/assets/036-vector-54-3934.svg` (combined HH Goa lockup)
- `https://hhgoa.com/assets/Venue%20pin.png` (house / poster composition)
- `https://hhgoa.com/assets/team.png` (portrait card treatment)
- `https://hhgoa.com/assets/agenda.png` (illustrative language)

For implementation, place any art used inside an exported Canvas locally in the project so the browser can safely export the finished image.

## Visual system

### Type hierarchy

| Use | Typeface | Guidance |
| --- | --- | --- |
| Hero / major names | Imbue 800–900 | Tight leading (`.65–.78`), slight negative tracking; enormous and editorial. |
| Builder class | Imbue 800 | Hot pink by default; it should feel like a stamp people quote. |
| Labels / UI / metadata | Victor Mono 500–700 | Uppercase, 8–12 px UI label / 14–20 px image export label; letterspacing about `.04–.08em`. |
| Body copy | Victor Mono 500 | Compact, human, not product-marketing-heavy. |

### Shape language

- Use hand-drawn black/deep-green outlines, 1–2 px in interface and 5–8 px in exported artwork.
- Combine rounded arch photo bays with hard signboard rectangles.
- Yellow is a physical paper / sun / ticket colour; pink is a class stamp / signal, not a background wash.
- Avoid glass, blurred cards, floating pills everywhere, perfect 12px-radius SaaS rectangles, chrome, gradients-as-decoration, or neon blue/purple cyberpunk.

### Controlled texture

Add a fine dot / paper grain layer at 5–10% opacity and occasional diagonal tile lines. It should prevent flat colour from feeling synthetic without affecting readability or export quality.

## Screen direction

### 1. Hero

- Background: deep green with a solar-yellow semi-cropped sun and restrained pink wave line.
- Headline: `MAKE YOUR / BUILDER SIGNAL / UNMISSABLE.`
- “BUILDER SIGNAL” is pink; the rest warm paper.
- Small proof row: `NO LOGIN`, `MADE FOR MOBILE`, `READY IN SECONDS`.
- Keep the HH Goa lockup small and respected in the top-left. This is an event experience, not a brand takeover by Builder House.

### 2. Format chooser

Three equally clear options, each with an aspect ratio label.

| Format | Description | Graphic cue |
| --- | --- | --- |
| Builder ID | Social post passport | Vertical arch / ID silhouette |
| PFP Frame | Face-safe X profile frame | Circular ring |
| Crew Manifest | You + teammates on one poster | House / windows / roof triangle |

The selected choice changes its paper colour to yellow with a pink active dot. Do not hide the other two formats in a menu.

### 3. Workbench

Desktop is a three-part print sheet: controls / live artwork / actions. Mobile becomes: **preview → controls → actions** so people see the result before they have to read a form.

Controls:

- Large photo upload row. “DROP YOUR PHOTO” or “SWAP YOUR PHOTO”, never “Browse files.”
- Only two mandatory text fields: name and stack/role.
- Generated Builder Class appears as a stamped line with an easy reroll button.
- Three weather variants: `Tide`, `Heat`, `After dark`; each previewed by real colour chips.
- In Crew mode, call out “You’re slot one” and support exactly up to three additional people. This keeps the composition premium instead of becoming an unstructured grid.

Preview:

- Treat the finished card like a physical print floating over a lush-but-flat painted surface.
- A tiny `LIVE COMPOSITE` status is enough; do not add a fake progress bar.
- On hover / touch hold, show crop guides and `DRAG TO REPOSITION`.

Actions:

- Strong yellow `DOWNLOAD IMAGE` button first.
- Green/pink outlined `SHARE TO X ↗` second.
- Microcopy makes the social preview behaviour clear and builds trust.

## Export-art direction and specs

The exported artwork is more important than the app chrome. It must instantly say HH Goa in an X feed.

### Builder ID — 1200 × 1500 px (4:5)

- Deep-green header with HH Goa marks, `GOA, INDIA`, and `28—31 OCT 2026` metadata.
- Large arched photo bay (about 57% of card width) with an outlined frame. The photo is front and centre.
- Right side is an identity rail: name, “BUILDER CLASS”, builder class, “STACK / ROLE”, and small access metadata.
- Bottom is a dark green passport band with a code / barcode rhythm, crew name or `INDEPENDENT SIGNAL`, and `#FRAMEINGOA`.
- Use pink/yellow triangle accents as a reference to “day of triangle,” but never cover the face.
- Ensure name and title remain legible for up to two wrapped lines.

### PFP frame — 2048 × 2048 px

- The face area must remain uncluttered inside an inner circular safe zone (at least 70% of width).
- Build a strong outer ring: solar-yellow primary, short pink arc, paper-colour outer arc.
- Add HH Goa 2026, Goa/date metadata, a small lockup, and `#FRAMEINGOA` around the perimeter only.
- In the editor, show a dashed circular X safe-zone guide. Do not export the guide.

### Crew Manifest — 1600 × 1200 px (4:3)

- It should feel like a collectable “house of builders” poster: four portrait windows across a graphic home / event board.
- First slot is always the person currently creating. Support three teammates, with intentional “OPEN SLOT” art when not filled.
- Use a large `BUILD / CREW` title, crew name signboard, event metadata, headcount, and `#FRAMEINGOA`.
- This is likely the best viral asset. It must be more beautiful than a contact-sheet grid.

### Social preview — 1200 × 630 px

- It is a composition derived from the selected output, not a generic app thumbnail.
- Include the actual person/photo, name, role, builder class, HH Goa ’26, and `#FRAMEINGOA`.
- It must remain readable in the compressed X card preview.

## Motion specification

Motion should feel like ink, paper, and physical signboards — decisive and playful, never “tech demo.” Build a reduced-motion equivalent for all of it.

| Moment | Motion |
| --- | --- |
| Page arrival | Header and hero settle in with a 250–450 ms spring/fade. Never stagger more than 2–3 things. |
| Format selection | The chosen card rises 4–6 px and the small pink dot pops in. |
| Upload success | Photo bay scales from `.98` to `1`; paper grain/sun shifts a few pixels, then stops. |
| Crop drag | Frame gains a slightly tighter shadow, safe guides appear, nearby illustrated palms/waves can sway 2–4 px. |
| Builder class reroll | Stamp rotates a few degrees and flicks to the new copy; keep under 300 ms. |
| Export | Button label changes to `EXPORTING`; brief low-opacity overlay on the preview, no fake long loading sequence. |
| Buttons | Lift 2–3 px, bold colour inversion, no big bouncy scale. |

Respect `prefers-reduced-motion`: suppress the floating/spring effects and retain only instant state changes.

## Interaction notes

- Desktop: cursor changes from grab to grabbing over an editable photo.
- Mobile: crop control must use `touch-action: none` only on the canvas area; the rest of the page must scroll normally.
- Do not make manual cropping mandatory. Smart centre-cover gives a usable first result.
- Keep form state when switching formats.
- Show a helpful inline error for unsupported, oversized, or failed HEIC photos; never dump a technical exception.
- Keep all touch targets at least 44×44 px on mobile.

## Exact content / voice

Use short, human, lightly irreverent build-station language:

- `MAKE YOUR BUILDER SIGNAL UNMISSABLE.`
- `YOUR GENERATED BUILDER CLASS`
- `ONE RHYTHM. EVERYTHING INTENTIONAL.`
- `YOU’RE SLOT ONE. ADD UP TO THREE TEAMMATES.`
- `YOUR ORIGINAL STAYS ON YOUR DEVICE.`
- `ONE TAP, PROPER PREVIEW.`
- `MAKE NOISE.`

Avoid empty hype vocabulary such as “revolutionary”, “next-gen”, “unlock”, “journey”, or “powered by AI.” The generated title can be playful (`Latency Hunter`, `Pixel Weather-Maker`, `Terminal Nomad`) but the tool should not wait on an LLM to make one.

## Designer handoff checklist

- [ ] Figma desktop and mobile artboards for every state listed above
- [ ] Exported source artwork at each exact output dimension
- [ ] Defined crop safe zones / photo slots
- [ ] Component specs for buttons, inputs, upload, theme chips, tabs, toast, errors
- [ ] Motion notes and reduced-motion state
- [ ] Colour + type tokens
- [ ] Original, local-export-safe assets with licensing/source noted
- [ ] No hard-coded personal photo or name in the master export design

## Things to deliberately avoid

- Generic neon cyberpunk / terminal-green hacker art
- Glassmorphism and blurred backdrop cards
- A lanyard-print badge visual
- A dense dashboard, profile feed, leaderboard, wallet, login, or social graph
- Requiring users to use an LLM or wait for an AI result
- The event logo pasted onto an unrelated template
- More than one major CTA at each decision point
