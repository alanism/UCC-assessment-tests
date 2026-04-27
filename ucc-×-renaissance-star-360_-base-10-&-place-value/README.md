# UCC x Renaissance STAR 360 - Base-10 & Place-Value

## Product Summary

Adaptive number-sense instrument focused on place value, regrouping, decimal reasoning, and structural understanding of base-10 representations under time pressure.

## Intended Operator

Assessment operators and math coaches who need a short diagnostic scan of number-structure fluency rather than a long-form lesson workflow.

## Core Workflow

1. Enter student name, reported grade, and session duration.
2. Run timed place-value items with optional hints.
3. Allow the adaptive engine to move between easier and harder representations based on accuracy.
4. Review metrics, export the telemetry log, and optionally generate a coach memo.

## Inputs Collected

- Student name
- Reported grade
- Session duration
- Per-item answer input
- Hint use, timing, correctness, and difficulty shifts

## Adaptive Logic And Timing

- Session timer is selected before launch.
- Each item has a 30-second timer.
- Correct responses raise difficulty up to level 5.
- Misses and timeouts reduce difficulty and are logged in item telemetry.

## Outputs And Analytics

- Review-state metrics panel
- Performance index and max difficulty reached
- Item-level telemetry export as `.txt`
- Optional AI-generated coach memo

## AI Usage

- Live AI is used only for coach memo generation.
- Operators can validate and save OpenAI, Gemini, or Claude locally in the app.
- Saved keys and model choices are isolated to this app origin.

## Local Operation

- Install with `npm install`
- Run with `npm run dev`
- No runtime dependency on `.env.local` keys
- Source-discovered AI Studio link: `https://ai.studio/apps/drive/14kFKwiX4G6ErHx95G3xH3zEs_WNDAROP`
