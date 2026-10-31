# SpaceLab Project Brief

## Working Agreement

Before starting each future task on this project, read this brief first. Work on one task at a time. Preserve existing features. After each task, report what changed and how to test it. When writing mission or space-science content, list facts that are not fully verified so the project owner can confirm them on [ISRO](https://www.isro.gov.in/) and [NASA](https://www.nasa.gov/).

## Realism Upgrade

### Upgrade goals

1. **Immersive 3D space atmosphere:** Make users feel as if they are floating in space, using depth, parallax, and slow drifting motion.
2. **Mission-control interface:** Use advanced, space-themed buttons and UI with a spacecraft cockpit HUD style.
3. **Realistic solar system:** Use NASA-based planet texture images from [Solar System Scope](https://www.solarsystemscope.com/textures/) under CC BY 4.0, stored in `public/textures`. Do not use plain colored balls as planet visuals.
4. **More engaging rocket game:** Add missions, rockets, stages, a live HUD, random events, scoring, and realistic launch, orbit, and crash animations.
5. **Space Knowledge Hub:** Add separate pages for space missions and space topics so students can learn more.

### Implementation rules

- Use 2K textures on desktop and 1K or lower textures on phones and in Lite mode.
- Lazy-load textures and show a loading progress indicator.
- Keep the site smooth on low-end phones. Lite mode must work everywhere with static or simple visuals.
- Add a credits section for Solar System Scope textures (CC BY 4.0) and NASA imagery.
- Keep facts accurate. Whenever mission or space content is written, list any facts that are not fully certain so they can be verified on ISRO and NASA websites.
- Do not break existing features.
- Complete one task at a time. After each task, say what changed and how to test it.
