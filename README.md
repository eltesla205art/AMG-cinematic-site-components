# Cinematic Site Modules

30 cinematic website modules. Each one is a single HTML file. No frameworks. No build step. No npm. Just open it.

## Preview

Open `index.html` to browse all 30 modules with animated mini-demos, or open any individual module file directly in a browser.

## Get Started

```bash
git clone https://github.com/robonuggets/cinematic-site-components.git
cd cinematic-site-components
```

Then open `index.html` in your browser, or open any module file directly.

## Claude Code Skill

This repo ships a `cinematic-modules` skill that picks 2-3 modules for a brief and combines them into one finished single-file site.

- **Inside this repo:** just run Claude Code here and use `/cinematic-modules <describe your site>`.
- **From any project:** run `./install-skill.sh` once. It copies the skill and all 30 modules to `~/.claude/skills/cinematic-modules/`.

```
/cinematic-modules dark SaaS landing page with a scroll-driven hero
/cinematic-modules --modules "text-mask, sticky-stack, kinetic-marquee" --name "Acme Corp"
```

## The 30 Modules

### Scroll-Driven (9)
| # | Module | What It Does |
|---|---|---|
| 01 | Text Mask Reveal | Headline fills with colour as you scroll |
| 02 | Sticky Stack Narrative | Product pins, features scroll past it |
| 03 | Layered Zoom Parallax | Depth layers, foreground zooms past |
| 04 | Horizontal Scroll Hijack | Vertical scroll → horizontal gallery |
| 05 | Sticky Card Stack | Cards pin and stack on each other |
| 06 | Scroll SVG Draw | Lines draw themselves on scroll |
| 07 | Curtain Reveal | Hero splits open like curtains |
| 08 | Split Screen Scroll | Two halves scroll opposite directions |
| 09 | Scroll Color Shift | Background changes per section |

### Cursor & Hover (8)
| # | Module | What It Does |
|---|---|---|
| 10 | Cursor-Reactive | Glow, 3D tilt, magnetic buttons, ripples |
| 11 | Accordion Slider | Strips expand on hover |
| 12 | Cursor Image Reveal | Before/after with wipe, spotlight, split |
| 13 | Hover Image Trail | Cursor leaves fading images behind |
| 14 | 3D Flip Cards | Cards rotate to reveal back |
| 15 | Magnetic Repel Grid | Tiles push away from cursor |
| 16 | Spotlight Border Cards | Borders illuminate under cursor |
| 17 | Drag-to-Pan Grid | Infinite draggable canvas |

### Click & Tap (6)
| # | Module | What It Does |
|---|---|---|
| 18 | View Transition Morphing | Elements shape-shift between states |
| 19 | Particle Explosion Button | CTAs burst on click |
| 20 | Odometer Counter | Digit wheels roll to target |
| 21 | 3D Coverflow Carousel | Center focused, edges angled |
| 22 | Dynamic Island Nav | Pill morphs for notifications |
| 23 | macOS Dock Nav | Icons magnify on hover |

### Ambient & Auto (7)
| # | Module | What It Does |
|---|---|---|
| 24 | Text Scramble Decode | Matrix-style character cycling |
| 25 | Kinetic Marquee | Infinite text bands, scroll-reactive |
| 26 | Mesh Gradient Background | Animated colour blobs |
| 27 | Circular Text Path | Text on spinning circle |
| 28 | Glitch Effect | RGB channel split |
| 29 | Typewriter Effect | Text types itself |
| 30 | Gradient Stroke Text | Animated gradient on outlined text |

## Tech Stack

- HTML + CSS + vanilla JS
- GSAP + ScrollTrigger (CDN)
- Google Fonts (CDN)
- That's it.

## License

MIT — see [LICENSE](LICENSE) for details.

## Attribution

Created by Jay from RoboLabs. Learn more at [RoboNuggets](https://robonuggets.com)
