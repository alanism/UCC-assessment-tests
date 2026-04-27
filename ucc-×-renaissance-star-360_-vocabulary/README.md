# UCC x Renaissance STAR 360 - Vocabulary

## Product Summary

Adaptive vocabulary instrument that measures definition knowledge, context discrimination, antonym recognition, and morphology under time pressure.

## Intended Operator

Reading specialists and assessment operators who want a compact lexical-depth scan with reviewable telemetry.

## Core Workflow

1. Launch directly into testing mode.
2. Present timed multiple-choice vocabulary items.
3. Let difficulty adjust after each response.
4. Finish the session and review the analytics tab.

## Inputs Collected

- Selected answer index
- Vocabulary channel, distractor type, and skill-tag telemetry
- Response timing, correctness, and difficulty transitions

## Adaptive Logic And Timing

- Each item uses a 30-second timer.
- Correct answers raise difficulty up to level 5.
- Incorrect answers reduce difficulty and log the miss into the session history.

## Outputs And Analytics

- Metrics review state
- Item log and level history
- Session summary via `BrainAnalytics`

## AI Usage

- No live provider call is wired into this instrument in v1.
- The Local AI Settings panel stores operator-selected provider/model locally for this app origin only.

## Local Operation

- Install with `npm install`
- Run with `npm run dev`
- No build-time API key is required
- Source-discovered AI Studio link: `https://ai.studio/apps/drive/1TUUjZQ9P4Ljg4FC0JZ3KpuLoThzdHlIs`
