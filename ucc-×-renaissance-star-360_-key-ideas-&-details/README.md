# UCC x Renaissance STAR 360 - Key Ideas & Details

## Product Summary

Adaptive informational-reading instrument that measures meaning construction, evidence tracking, and distractor resistance through timed multiple-choice text analysis.

## Intended Operator

Reading coaches and assessment operators who want a lightweight comprehension scan with explicit review metrics rather than a content-delivery workflow.

## Core Workflow

1. Start directly in the instrument without setup metadata.
2. Present an informational passage and question with four answer choices.
3. Run each item under a 60-second timer with adaptive difficulty changes after each response.
4. Finish the session and inspect the review metrics in `BrainAnalytics`.

## Inputs Collected

- Selected answer index per item
- Passage/question telemetry
- Item timing and correctness
- Difficulty transitions and response history

## Adaptive Logic And Timing

- Each item uses a 60-second timer.
- Correct answers raise difficulty up to level 5.
- Incorrect answers lower difficulty and are logged in item telemetry.

## Outputs And Analytics

- Review-state metrics tab
- Item log and level-history analytics
- Session performance summary in the embedded analytics component

## AI Usage

- No live provider call is wired into this instrument in v1.
- The Local AI Settings panel stores operator-selected provider/model locally for this app origin only.

## Local Operation

- Install with `npm install`
- Run with `npm run dev`
- No build-time API key is required
- Source-discovered AI Studio link: `https://ai.studio/apps/drive/1OFgAaOQ-Sbsw9uFVIJNsl587K7VtZ6Om`
