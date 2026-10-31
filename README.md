# SpaceLab

SpaceLab is a bilingual (English and Hindi) space-learning web app for students and teachers. Students can explore the solar system, experiment with a simplified rocket launch, and take a space quiz. Teachers can review class activity from the built-in demo roster and activity saved in the browser.

## Features

- **Home:** Earth-to-Mars journey, Indian space mission timeline, feature cards, and student briefing form.
- **Solar System Explorer:** interactive Sun and planet scene with a 2D fallback and Lite mode.
- **Rocket Launch:** adjust angle, fuel, and difficulty; see an outcome and a short science explanation.
- **Quiz:** five randomized questions with feedback, explanations, score, and badge.
- **Teacher Dashboard:** class summary, topic chart, sortable roster, status tags, and CSV export.
- **English and Hindi:** language toggle for interface content.
- **Lite mode:** reduces or disables demanding 3D and motion effects.
- **Local activity tracking:** student details and learning activity are stored in the browser; there is no account service or cloud sync.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ (Vite 8 requirement) and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To create and serve a production build locally:

```sh
npm run build
npm run preview
```

Other project scripts:

```sh
npm run lint
```

## Deploy

This is a Vite single-page application. Both deployment configs publish the `dist` directory and route direct requests (including `/explorer`, `/launch`, `/quiz`, and `/teacher`) to `index.html` so browser refreshes continue to work.

### Vercel

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`
- `vercel.json` supplies the SPA rewrite.

### Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- `netlify.toml` supplies the SPA fallback redirect.

No environment variables are required for the current local-only demo.

## Tech stack

- React 19 and React Router
- Vite 8
- Three.js with React Three Fiber for the interactive solar system
- GSAP and ScrollTrigger for scroll and route motion
- Recharts for the teacher topic chart
- Lenis for smooth scrolling
- CSS, Tailwind CSS 4, and local React components

## Attributions

- **Watermelon UI** — component patterns and adapted card, button, table, and dashboard styling. Watermelon UI is MIT licensed. See [Watermelon UI](https://ui.watermelon.sh/) and its [copyright and attribution guidance](https://ui.watermelon.sh/copyright).
- **Geist** — interface typeface from the Geist Fontsource package.
- Space mission and astronomy facts are educational summaries. The Home page flags figures that should be verified before classroom or public use.

## Roadmap

- Real student and teacher accounts
- Cloud database and synchronized class activity
- AI tutor for guided space-science questions
- More interface languages
- NCERT curriculum mapping
