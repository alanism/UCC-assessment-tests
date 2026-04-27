# UCC x Renaissance STAR 360 - Algebra Readiness

## Product Summary

Adaptive math instrument that measures algebra readiness through hidden-value table puzzles that avoid explicit variable notation while still testing inverse reasoning, multi-step structure, and time-constrained decision quality.

## Intended Operator

Assessment operators, learning coaches, and internal admins running short diagnostic math sessions and reviewing post-session telemetry.

## Core Workflow

1. Enter student name, reported grade, and session duration.
2. Start a timed session with 30-second items and optional hints.
3. Let the adaptive ladder move difficulty up after correct answers and down after misses or timeouts.
4. Review the performance summary, export the telemetry log, and optionally generate a coach memo.

## Inputs Collected

- Student name
- Reported grade
- Session duration
- Numeric answer input per item
- Hint usage, response timing, correctness, and difficulty transitions

## Adaptive Logic And Timing

- Whole-session timer is operator-selected at start.
- Each item has a 30-second response window.
- Correct answers increase difficulty up to level 5.
- Incorrect answers and timeouts reduce difficulty, preserving a session log of the transition path.

## Outputs And Analytics

- Session summary and performance index
- Difficulty ladder reached and timing breakdown
- Full item-level telemetry export as `.txt`
- Optional coach memo generated from a saved local AI provider/model

## AI Usage

- Live AI is used only for the coach memo action.
- Operators configure OpenAI, Gemini, or Claude in the in-app Local AI Settings panel.
- Credentials are stored in IndexedDB locally for this app origin only.

## Local Operation

- Install with `npm install`
- Run with `npm run dev`
- No build-time API key is required for runtime operator use
- Source-discovered AI Studio link: `https://ai.studio/apps/drive/1slGautQIu09-PEF2hleGMpQAt6ry45PL`
