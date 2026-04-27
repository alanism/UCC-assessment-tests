# UCC x Renaissance STAR 360 Suite

This repository contains 10 standalone Vite/React apps that simulate or support STAR 360-style cognitive instruments across reading, vocabulary, math, and post-session psychometric analysis.

**Live Suite:** [https://unrivaled-kangaroo-9e7478.netlify.app](https://unrivaled-kangaroo-9e7478.netlify.app)
**GitHub Repository:** [https://github.com/alanism/UCC-assessment-tests](https://github.com/alanism/UCC-assessment-tests)

## Suite Notes

- Each app is deployable on its own origin.
- Local AI settings are stored in browser IndexedDB per app origin.
- A validated key saved in one deployed app does not automatically appear in another deployed app on a different URL.
- Build-time `.env.local` keys are no longer required for runtime operator use.

## App Matrix

| App | Domain | Modality | Live AI in v1 | Source-discovered runtime link |
| --- | --- | --- | --- | --- |
| `ucc-x-renaissance-star-360---algebra-readiness` | Math / algebra readiness | Timed hidden-value table problems | Yes, coach memo | AI Studio link in source README |
| `ucc-×-renaissance-star-360_-base-10-&-place-value` | Math / number sense | Timed place-value and regrouping problems | Yes, coach memo | AI Studio link in source README |
| `ucc-×-renaissance-star-360_-home-directory` | Suite launcher | Directory + information panels | No | AI Studio link in source README |
| `ucc-×-renaissance-star-360_-key-ideas-&-details` | Reading / informational meaning | Timed multiple choice | No | AI Studio link in source README |
| `ucc-×-renaissance-star-360_-literature-craft-&-structure` | Reading / literary analysis | Timed multiple choice | No | AI Studio link in source README |
| `ucc-×-renaissance-star-360_-literature-key-ideas-&-details` | Reading / literary meaning | Timed multiple choice | No | AI Studio link in source README |
| `ucc-×-renaissance-star-360_-range-&-complexity` | Reading / load sustainment | Timed multiple choice with complexity ladder | No | AI Studio link in source README |
| `ucc-×-renaissance-star-360_-reading--informational_-craft-&-structure` | Reading / informational structure | Timed multiple choice | No | AI Studio link in source README |
| `ucc-×-renaissance-star-360_-test-assessment` | Psychometric reporting | Telemetry import + report generation | Yes, full report generation | AI Studio link in source README |
| `ucc-×-renaissance-star-360_-vocabulary` | Vocabulary / morphology | Timed multiple choice | No | AI Studio link in source README |

## Shared Runtime Pattern

- Assessment apps run inside a single `App.tsx` entry with Tailwind loaded from `index.html`.
- Most instruments collect in-memory telemetry and surface results through a `BrainAnalytics` review screen.
- Only `algebra-readiness`, `base-10-&-place-value`, and `test-assessment` currently make live provider calls.
- All 10 apps now expose the same Local AI Settings panel so operators can validate and save OpenAI, Gemini, or Claude credentials locally per origin.

## Operator Runbook

1. Open any app folder.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.
4. If the app uses live AI features, open `Local AI Settings`, validate a provider key, choose a model, and save.
5. Operate the instrument normally; exported telemetry stays local to that app session unless the operator downloads it.
