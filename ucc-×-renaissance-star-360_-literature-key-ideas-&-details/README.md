# UCC x Renaissance STAR 360 - Literature Key Ideas & Details

## Product Summary

Adaptive literature-reading instrument focused on identifying central ideas, supporting details, and inference quality inside narrative passages.

## Intended Operator

Reading specialists and diagnostic operators who need a short narrative-comprehension scan with observable item-by-item performance telemetry.

## Core Workflow

1. Start directly in the test state.
2. Present a literary passage and multiple-choice question.
3. Time each item at 45 seconds while the difficulty ladder responds to accuracy.
4. End the session and inspect the analytics tab for review.

## Inputs Collected

- Selected answer index
- Passage, question, and option telemetry
- Timing, correctness, and difficulty transitions
- Inference-attempt metrics inside the analytics layer

## Outputs And Analytics

- Review-state metrics tab
- Item log and difficulty history
- Session summary via `BrainAnalytics`

## AI Usage

- No live provider call is wired into this instrument in v1.
- The Local AI Settings panel stores operator-selected provider/model locally for this app origin only.

## Local Operation

- Install with `npm install`
- Run with `npm run dev`
- No build-time API key is required
- Source-discovered AI Studio link: `https://ai.studio/apps/b0e38bf4-5429-4905-ae2c-ecd8ae207d00`
