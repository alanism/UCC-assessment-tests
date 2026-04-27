# UCC x Renaissance STAR 360 - Range & Complexity

## Product Summary

Adaptive reading-load instrument that measures how far a learner can sustain lexical, syntactic, conceptual, domain, and discourse complexity before performance breaks.

## Intended Operator

Assessment operators and literacy coaches who need a compact load-tolerance scan rather than a standard passage-comprehension lesson flow.

## Core Workflow

1. Begin in testing mode with the lowest complexity level.
2. Present timed multiple-choice items generated from a complexity ladder.
3. Increase or decrease complexity based on response quality.
4. Finish the session and review the analytics state.

## Inputs Collected

- Selected answer per item
- Complexity vector and level per item
- Passage and question telemetry
- Timing, correctness, and ladder progression

## Adaptive Logic And Timing

- Each item uses a 45-second timer.
- Complexity starts at level 0 and can climb through the configured ladder.
- The item generator tries to avoid passage repetition inside the session.

## Outputs And Analytics

- Metrics review tab
- Item-level complexity telemetry
- Session summary and level history in `BrainAnalytics`

## AI Usage

- No live provider call is wired into this instrument in v1.
- The Local AI Settings panel stores operator-selected provider/model locally for this app origin only.

## Local Operation

- Install with `npm install`
- Run with `npm run dev`
- No build-time API key is required
- Source-discovered AI Studio link: `https://ai.studio/apps/drive/1RGgpqfNEWMMheTxevG1xC8xDx0puiWoX`
