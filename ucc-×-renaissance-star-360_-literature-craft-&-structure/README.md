# UCC x Renaissance STAR 360 - Literature Craft & Structure

## Product Summary

Adaptive literary-reading instrument focused on narrator awareness, tone, figurative language, and story-structure recognition under timed conditions.

## Intended Operator

Reading specialists and internal assessment operators who need a short literary-analysis scan with reviewable performance telemetry.

## Core Workflow

1. Launch directly into the instrument.
2. Present a literary passage and multiple-choice analysis question.
3. Run each item on a 45-second timer while the adaptive ladder adjusts difficulty.
4. Finish and review results in the analytics view.

## Inputs Collected

- Selected answer per item
- Passage and choice telemetry
- Time-to-answer and correctness
- Difficulty path and mastery/mistake history

## Adaptive Logic And Timing

- Each item is timed at 45 seconds.
- Correct answers move the learner upward through difficulty.
- Incorrect responses move difficulty downward and remain visible in the item log.

## Outputs And Analytics

- Metrics review panel
- Item telemetry and difficulty history
- Session summary via `BrainAnalytics`

## AI Usage

- No live provider call is wired into this instrument in v1.
- The Local AI Settings panel stores operator-selected provider/model locally for this app origin only.

## Local Operation

- Install with `npm install`
- Run with `npm run dev`
- No build-time API key is required
- Source-discovered AI Studio link: `https://ai.studio/apps/drive/1mDvkUdjiyHRdTTHRJy6TW8OtW6nan-zY`
