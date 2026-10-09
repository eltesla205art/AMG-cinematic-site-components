---
name: cinematic-modules
description: Pick and combine cinematic website modules (scroll-driven reveals, cursor effects, click interactions, ambient typography) from a library of 30 single-file HTML demos into one complete, production-quality single-file website. Use when the user wants a "cinematic site", a premium/animated landing page, asks to "build me a site" with scroll or hover effects, names a module (text mask, sticky stack, zoom parallax, horizontal scroll, curtain reveal, marquee, mesh gradient, glitch, coverflow, dock nav, etc.), or says "combine modules" / "pick modules for".
---

# Cinematic Modules

Turn a short brief into a single-file website by picking 2-3 interaction modules from the library and combining them into one coherent page.

```
/cinematic-modules dark SaaS landing page with scroll animation and a feature section
/cinematic-modules bakery website, warm palette, cosy feel
/cinematic-modules --modules "text-mask, sticky-stack, kinetic-marquee" --theme dark --name "Acme Corp"
```

## Where the modules live

Each module is a working, standalone HTML file. Find the library in this order:

1. `modules/` next to this SKILL.md (global install via `install-skill.sh`)
2. The repository root, three levels up from this file (`../../../*.html`) when used inside the cinematic-site-components repo

If neither exists, tell the user to clone `https://github.com/robonuggets/cinematic-site-components` and run `./install-skill.sh`.

**Always read the source of every module you pick before writing code.** The demos contain tuned easing, timing, ScrollTrigger settings and edge-case handling. Port their CSS/JS and adapt the content; don't re-invent the effect from memory.

## Process

### 1. Parse the brief
- Business type (SaaS, bakery, agency, portfolio, e-commerce...)
- Mood (premium, playful, technical, warm, minimal, bold)
- Theme (dark / light; default dark — all demos are dark)
- Explicit modules (`--modules`), business name (`--name`, or infer)

### 2. Pick modules (skip if `--modules` given)

| Business type | Suggested combo |
|---|---|
| SaaS / Tech | Sticky Stack + Spotlight Borders + Text Scramble |
| Agency / Studio | Horizontal Scroll + Image Trail + Kinetic Marquee |
| E-commerce | Color Shift + Accordion Slider + Odometer |
| Restaurant / Food | Curtain Reveal + Accordion Slider + Circular Text |
| Portfolio / Creative | SVG Draw + Drag-to-Pan + Glitch |
| Luxury / Jewellery | Zoom Parallax + Flip Cards + Mesh Gradient |
| Real Estate / Renovation | Split Scroll + Cursor Image Reveal + Odometer |
| Fitness / Health | Color Shift + Particle Button + Typewriter |
| Automotive | Curtain Reveal + Cursor-Reactive + Odometer |
| Professional Services | Sticky Stack + Flip Cards + Gradient Stroke |

Rules:
- 2-3 modules, never more (otherwise it's a demo reel, not a website)
- Exactly one scroll-driven module — it's the narrative backbone
- Second: a cursor/hover or click/tap module
- Third (optional): an ambient/typography module
- State each pick and why, one line each

### 3. Build

**Architecture (never break):**
- One `index.html`: CSS in `<style>`, JS in `<script>`
- No frameworks, no npm, no build step
- CDN only — the same versions the modules use:
  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  ```
  Only include GSAP if a chosen module uses it (see table below).
- Responsive from 375px to 1440px+
- Real, on-brand copy — no lorem ipsum, no emojis

**Page structure:**
1. Hero — the scroll-driven module
2. Features / services — the interaction module
3. Social proof / stats — optional ambient module
4. About — simple fade-up
5. Contact / CTA
6. Footer — minimal

**Merging modules safely:**
- The demos all define `:root { --bg --text --muted --accent }`. Merge into one `:root`; don't duplicate.
- Scope each module's CSS under a section class (`.hero-mask .line`, not `.line`) — demos reuse generic class names.
- Wrap each module's JS in its own function/IIFE; rename colliding globals.
- Register ScrollTrigger once; call `ScrollTrigger.refresh()` after fonts/images load.
- Strip demo chrome (module badges, "scroll down" hints, back links to index.html).
- Add a `prefers-reduced-motion: reduce` path (the demos don't have one): disable scroll hijacks/pinning and continuous animations, show final states.
- Cursor-only effects (image trail, magnetic grid, cursor glow, dock magnify) need a touch fallback or must be hidden under `(hover: none)`.

**Typography** (Google Fonts):
| Font | Mood |
|---|---|
| Outfit 300-700 (library default) | Modern, versatile |
| Geist / Geist Mono | Technical, SaaS |
| Space Grotesk | Bold, editorial, agency |
| Fraunces or Instrument Serif (display) + Outfit (body) | Luxury, food, warm |

Avoid Inter, Roboto, Arial — they read generic.

**Palettes** — never pure `#000` backgrounds:
| Name | `--bg` | `--surface` | `--accent` | `--text` | `--muted` |
|---|---|---|---|---|---|
| Warm Night (default) | `#0a0a0b` | `#111114` | `#c8a97e` | `#f0ede8` | `#5a5a5e` |
| Deep Teal | `#0a0a0b` | `#111114` | `#5eadb5` | `#f0ede8` | `#5a5a5e` |
| Ember | `#09090b` | `#111114` | `#e85d3a` | `#f0ede8` | `#5a5a5e` |
| Indigo | `#09090b` | `#111114` | `#6366f1` | `#f0ede8` | `#5a5a5e` |
| Forest | `#09090b` | `#111114` | `#4ca879` | `#f0ede8` | `#5a5a5e` |
| Cream (light) | `#f5f3ef` | `#ffffff` | `#4f46e5` | `#1a1a1f` | `#6b6b73` |
| Warm Ivory (light) | `#fafaf8` | `#ffffff` | `#e85d3a` | `#1a1a1f` | `#6b6b73` |

**Quality bar:**
- Tight tracking on headlines, relaxed leading on body, paragraphs ≤ 65ch
- Shadows tinted toward the background hue, not default grey
- Buttons: `translateY(-1px)` on hover, `scale(0.97)` on `:active`
- Optional SVG grain on a fixed pseudo-element, `opacity: .035`, `pointer-events: none`
- Animate only `transform` and `opacity`
- Use `100dvh` (with `100vh` fallback) for full-height sections

### 4. Output
Save as `index.html` in the current working directory (or a path the user gives). Tell the user:
1. Which modules were combined and why
2. The file path
3. How to preview: open it in a browser, or `npx serve .`

## Module library

GSAP column: whether the demo loads GSAP + ScrollTrigger.

### Scroll-Driven (pick exactly one)
| # | Module | File | What it does | GSAP |
|---|---|---|---|---|
| 01 | Text Mask Reveal | `text-mask.html` | Giant headline fills with colour as you scroll | yes |
| 02 | Sticky Stack Narrative | `sticky-stack.html` | Product pins, feature cards scroll past | yes |
| 03 | Layered Zoom Parallax | `zoom-parallax.html` | Depth layers at different speeds, foreground zooms past | yes |
| 04 | Horizontal Scroll Hijack | `horizontal-scroll.html` | Vertical scroll drives a horizontal gallery | yes |
| 05 | Sticky Card Stack | `sticky-cards.html` | Cards pin and stack on each other | yes |
| 06 | Scroll SVG Draw | `svg-draw.html` | SVG paths draw themselves on scroll | yes |
| 07 | Curtain Reveal | `curtain-reveal.html` | Hero splits open like curtains | yes |
| 08 | Split Screen Scroll | `split-scroll.html` | Two halves scroll in opposite directions | yes |
| 09 | Scroll Color Shift | `color-shift.html` | Background palette changes per section | yes |

### Cursor & Hover
| # | Module | File | What it does | GSAP |
|---|---|---|---|---|
| 10 | Cursor-Reactive | `cursor-reactive.html` | Glow, 3D tilt cards, magnetic buttons, ripples | no |
| 11 | Accordion Slider | `accordion-slider.html` | Strips expand on hover (horizontal + vertical) | yes |
| 12 | Cursor Image Reveal | `cursor-reveal.html` | Before/after wipe, spotlight, split | no |
| 13 | Hover Image Trail | `image-trail.html` | Cursor leaves fading images behind | no |
| 14 | 3D Flip Cards | `flip-cards.html` | Cards rotate to reveal the back | no |
| 15 | Magnetic Repel Grid | `magnetic-grid.html` | Tiles push away from the cursor | no |
| 16 | Spotlight Border Cards | `spotlight-border.html` | Borders illuminate under the cursor | no |
| 17 | Drag-to-Pan Grid | `drag-pan.html` | Infinite draggable canvas | no |

### Click & Tap
| # | Module | File | What it does | GSAP |
|---|---|---|---|---|
| 18 | View Transition Morphing | `view-transitions.html` | Cards expand into overlays, pills morph into panels | no |
| 19 | Particle Explosion Button | `particle-button.html` | CTAs burst into particles on click | no |
| 20 | Odometer Counter | `odometer.html` | Digit wheels roll to target numbers | yes |
| 21 | 3D Coverflow Carousel | `coverflow.html` | Centre-focused carousel, angled edges | no |
| 22 | Dynamic Island Nav | `dynamic-island.html` | Pill morphs to show notifications/status | no |
| 23 | macOS Dock Nav | `dock-nav.html` | Icons magnify as the cursor approaches | no |

### Ambient & Auto
| # | Module | File | What it does | GSAP |
|---|---|---|---|---|
| 24 | Text Scramble Decode | `text-scramble.html` | Matrix-style characters resolve to real text | yes |
| 25 | Kinetic Marquee | `kinetic-marquee.html` | Infinite text bands, scroll-reactive speed | yes |
| 26 | Mesh Gradient Background | `mesh-gradient.html` | Animated colour blobs | no |
| 27 | Circular Text Path | `circular-text.html` | Text on a spinning SVG circle | no |
| 28 | Glitch Effect | `glitch-effect.html` | RGB channel split | no |
| 29 | Typewriter Effect | `typewriter.html` | Text types itself (cycling/code/chat variants) | no |
| 30 | Gradient Stroke Text | `gradient-stroke.html` | Animated gradient along outlined text | no |

## Anti-patterns (never)
- Two scroll-driven modules (e.g. horizontal scroll + sticky cards) — both hijack scroll
- Cursor glow + spotlight borders together — competing cursor effects
- Marquee + typewriter in the same section — competing for attention
- Glitch on a luxury brand — wrong tone
- Image trail / magnetic grid as the only way to see content on mobile

## Iteration
| Request | Fix |
|---|---|
| "Too busy" | Drop the weakest module, go to 2 |
| "Not enough wow" | Add an ambient layer (mesh gradient behind hero, marquee between sections) |
| "Hard to read" | Stronger gradient scrim or `backdrop-filter` behind text |
| "Laggy on mobile" | Cut particle/trail counts, disable cursor effects under `(hover: none)` |
| "Wrong vibe" | Swap accent + font pairing first — fixes most vibe issues |
