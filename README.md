# Huth fastener stiffness calculator

A small static web tool that estimates the shear **compliance** and **stiffness** of a single bolt or rivet in a lap joint using the Huth (1986) fastener flexibility formula. Everything runs in the browser; nothing is sent to a server.

```
C = ((t1 + t2) / (2 d))^a · (b / n) · [ 1/(t1 E1) + 1/(n t2 E2) + 1/(2 t1 Ef) + 1/(2 n t2 Ef) ]
k = 1 / C
```

- `n = 1` for single shear, `n = 2` for double shear
- Joint-type constants: bolted metallic `a = 2/3, b = 3.0`; riveted metallic `a = 2/5, b = 2.2`; bolted graphite/epoxy `a = 2/3, b = 4.2`; or enter your own `a` and `b`
- Metric units only: thicknesses and diameter in mm, moduli in MPa, compliance in mm/N, stiffness in N/mm
- Shows the intermediate factors and each bearing term's share of the total flexibility
- Input validation and an explanation of the formula, its symbols and its limits
- English and Chinese interface, with a language switch in the page header (the choice is remembered in the browser)

The implementation follows the symmetric form from Huth's original LBF report FB-172 (1984). The ASTM STP 927 reprint contains a typographical error (an `n` in place of the `2` in the third bracket term); see the notes in the app.

## Repository layout

| Path | Contents |
| --- | --- |
| `src/lib/huth.ts` | Calculation core: presets, validation, `computeHuth()` |
| `src/lib/units.ts` | Metric unit labels (mm, MPa, mm/N, N/mm) and number formatting |
| `src/lib/calculator-state.ts` | Form state, parsing and unit switching |
| `src/lib/*.test.ts` | Vitest unit tests, including worked examples |
| `src/components/` | React UI (inputs, results, explanation) built with shadcn/ui |
| `.github/workflows/deploy-pages.yml` | Build and deploy to GitHub Pages |
| `paper/` | Explanatory paper on the Huth formula (added separately) |

## Running locally

Requires Node.js 22 or newer.

```bash
npm install
npm run dev        # dev server with hot reload
npm test           # Vitest unit tests
npm run lint       # oxlint
npm run build      # type-check and production build into dist/
npm run preview    # serve the production build locally
```

## Stack

Vite, React 19, TypeScript, Tailwind CSS v4 and [shadcn/ui](https://ui.shadcn.com). The formula is rendered with native MathML, so there is no math-typesetting dependency.

## Deployment to GitHub Pages

Every push to `main` runs `.github/workflows/deploy-pages.yml`, which installs dependencies, runs the tests, builds the site and publishes `dist/` with the official GitHub Pages actions.

One-time setup in the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**. The site is then served at `https://<owner>.github.io/<repo>/`.

Project pages live under a `/<repo>/` sub-path, so Vite needs a matching `base`. `vite.config.ts` derives it automatically from the `GITHUB_REPOSITORY` environment variable that GitHub sets in every workflow run, and falls back to `/` for local development. To override it (for example for a user/organization site or a custom domain), set `VITE_BASE_PATH` when building:

```bash
VITE_BASE_PATH=/ npm run build
```

## References

1. Huth, H. (1984). *Zum Einfluß der Nietnachgiebigkeit mehrreihiger Nietverbindungen auf die Lastübertragungs- und Lebensdauervorhersage*. LBF Report FB-172, Fraunhofer-Institut für Betriebsfestigkeit, Darmstadt.
2. Huth, H. (1986). Influence of Fastener Flexibility on the Prediction of Load Transfer and Fatigue Life for Multiple-Row Joints. In J. M. Potter (Ed.), *Fatigue in Mechanically Fastened Composite and Metallic Joints*, ASTM STP 927, pp. 221–250.
