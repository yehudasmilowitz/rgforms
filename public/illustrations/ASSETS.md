# Illustrations — AI artist brief

These illustrations drop into the site automatically. Each `AssetSlot` already
points at the target path below; while the file is missing, an on-concept
placeholder shows. **Save the finished art at the exact path and it renders with
zero code changes.**

Export **PNG, 1200 × 900 (4:3), @2x** (generate at 1536×1152+ and downscale for
crispness). Generate all four in one session so material, lighting, and palette
stay identical.

**Critical for background removal:** the reference look casts shadows onto a
gradient floor — we can't, because that fuses the subject to the backdrop and
ruins keying. So keep ALL shading on the objects themselves: let every element
**float** with only its own soft self-shadow, **no ground/cast shadow**, on a
**solid flat uniform mint-green `#00B140` backdrop** (edge-to-edge, no gradient,
glow, or texture) so the background removes in one click.

## House style — clean isometric interface

A modern **isometric digital illustration**: smooth, glassy/glossy UI panels and
objects rendered in a clean, minimalist isometric perspective. Soft cream-white
gradient fills on the panels, thin light outlines, gentle purple glow accents,
high-end and premium (Stripe / Linear / Spline energy) — refined and tactile, not
puffy clay, not flat clip-art. A few small solid floating spheres add depth. One
clear focal idea, lots of negative space.

**Strict palette (overall purple):** primary violet `#8771FF`, deep indigo
`#532BC7`, fuchsia accent `#D946EF`, warm-white / cream `#FAF8FF`, ink `#241640`,
soft grey `#C9C3E0`, with Sheets-green `#34A853` used sparingly as the "data"
accent. No text, letters, or labels anywhere; no photorealism, no logos, no human
faces.

Each prompt below is written as a structured JSON spec — feed it to the
generator as-is (or flatten the `desc` fields into a paragraph).

| Path | Where it appears |
|------|------------------|
| `/illustrations/hero.png` | Landing hero (right side) |
| `/illustrations/speed.png` | Benefits — "Live in under 2 minutes" |
| `/illustrations/alerts.png` | Benefits — "Instant email alerts" |
| `/illustrations/ownership.png` | Benefits — "Your HTML, your data" |

---

## 1 · `/illustrations/hero.png`

```json
{
  "high_level_description": "An isometric digital illustration of a contact form panel and a spreadsheet panel floating on a flat mint-green background, joined by a glowing purple connector, with one spreadsheet row lit Sheets-green. No visible text or labels.",
  "compositional_deconstruction": {
    "background": "A solid flat uniform mint-green (#00B140) background, edge-to-edge, no gradient or glow. Clean minimalist isometric perspective. Subjects float with only soft self-shadows — no shadows cast on the background.",
    "elements": [
      { "type": "obj", "desc": "A large isometric contact-form panel on the left, smooth glassy cream-white (#FAF8FF) gradient surface with a subtle violet (#8771FF) glow along its lower edge, containing several blank input fields drawn as thin light-grey (#C9C3E0) rounded outlines, no text or labels." },
      { "type": "obj", "desc": "A large isometric spreadsheet panel on the right, cream-white gradient surface tilted slightly, holding a grid of rows and columns, with one single row cell highlighted in Sheets-green (#34A853) to read as a new submission landing, no text or labels." },
      { "type": "obj", "desc": "A short glowing purple (#8771FF → #D946EF) connector arc looping from the form panel to the spreadsheet panel, conveying data flowing from one to the other, with a soft bright glow." },
      { "type": "obj", "desc": "A small solid warm-white sphere floating in the upper-left." },
      { "type": "obj", "desc": "A small solid deep-indigo (#532BC7) sphere floating in the upper-right." },
      { "type": "obj", "desc": "A small solid fuchsia (#D946EF) sphere floating in the lower-right." }
    ]
  }
}
```

## 2 · `/illustrations/speed.png`

```json
{
  "high_level_description": "An isometric digital illustration of a single contact-form panel floating on a flat mint-green background, with a glowing green 'online' status dot and a couple of motion lines suggesting it went live fast. No visible text or labels.",
  "compositional_deconstruction": {
    "background": "A solid flat uniform mint-green (#00B140) background, edge-to-edge, no gradient or glow. Clean minimalist isometric perspective. Subject floats with only a soft self-shadow — no shadow cast on the background.",
    "elements": [
      { "type": "obj", "desc": "A single isometric contact-form panel centered, smooth glassy cream-white (#FAF8FF) gradient surface with a subtle violet (#8771FF) glow, containing blank input fields as thin light-grey (#C9C3E0) rounded outlines, no text or labels." },
      { "type": "obj", "desc": "A small glossy Sheets-green (#34A853) 'online' status dot with a soft green glow on the corner of the panel." },
      { "type": "obj", "desc": "One or two thin glowing purple (#8771FF) motion / speed lines trailing the panel to suggest fast activation." },
      { "type": "obj", "desc": "A small solid warm-white sphere floating in the upper-left." },
      { "type": "obj", "desc": "A small solid fuchsia (#D946EF) sphere floating in the lower-right." }
    ]
  }
}
```

## 3 · `/illustrations/alerts.png`

```json
{
  "high_level_description": "An isometric digital illustration of a single glossy envelope lifting upward on a flat mint-green background, with a glowing notification badge. No visible text or labels.",
  "compositional_deconstruction": {
    "background": "A solid flat uniform mint-green (#00B140) background, edge-to-edge, no gradient or glow. Clean minimalist isometric perspective. Subject floats with only a soft self-shadow — no shadow cast on the background.",
    "elements": [
      { "type": "obj", "desc": "A single isometric envelope, smooth glassy surface with a violet→fuchsia gradient (#8771FF → #D946EF) and a soft purple glow, lifting/popping upward as if a notification just arrived, no text or labels." },
      { "type": "obj", "desc": "A small glossy notification badge on the envelope's upper-right corner, fuchsia (#D946EF) with a soft glow." },
      { "type": "obj", "desc": "A thin Sheets-green (#34A853) accent line or corner of a sheet peeking from inside the envelope flap, no text." },
      { "type": "obj", "desc": "A small solid warm-white sphere floating in the upper-left." },
      { "type": "obj", "desc": "A small solid deep-indigo (#532BC7) sphere floating in the lower-left." }
    ]
  }
}
```

## 4 · `/illustrations/ownership.png`

```json
{
  "high_level_description": "An isometric digital illustration of a single spreadsheet panel floating on a flat mint-green background, with a glowing unlocked-padlock badge signifying ownership. No visible text or labels.",
  "compositional_deconstruction": {
    "background": "A solid flat uniform mint-green (#00B140) background, edge-to-edge, no gradient or glow. Clean minimalist isometric perspective. Subject floats with only a soft self-shadow — no shadow cast on the background.",
    "elements": [
      { "type": "obj", "desc": "A single isometric spreadsheet panel, smooth glassy cream-white (#FAF8FF) gradient surface tilted slightly, holding a grid of rows and columns with a few cells tinted Sheets-green (#34A853), no text or labels." },
      { "type": "obj", "desc": "A glossy isometric unlocked-padlock badge resting on the panel's corner, violet→fuchsia (#8771FF → #D946EF) with a soft purple glow, shackle open to read as 'it's yours'." },
      { "type": "obj", "desc": "A small solid warm-white sphere floating in the upper-right." },
      { "type": "obj", "desc": "A small solid deep-indigo (#532BC7) sphere floating in the lower-left." }
    ]
  }
}
```
