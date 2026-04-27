# UCC x Renaissance STAR 360 - Test Assessment

## Product Summary

Psychometric reporting console that imports exported telemetry `.txt` files from assessment apps, combines them with student context, and produces four audience-specific diagnostic report sections.

## Intended Operator

Researchers, clinicians, coaches, and internal admins who need to transform raw assessment telemetry into a structured psychometric readout.

## Core Workflow

1. Enter student identity and school grade.
2. Import one or more telemetry `.txt` exports from other suite instruments.
3. Run a forensic scan using the saved provider/model from Local AI Settings.
4. Review the generated Psychometric Core, Coach Memo, Parent Memo, and Student Memo tabs.
5. Download the report as text or print the dossier view.

## Inputs Collected

- Student name
- Student grade
- Uploaded telemetry file contents

## Outputs And Analytics

- Four-section psychometric report
- Downloadable diagnostic text file
- Printable report layout

## AI Usage

- Live AI is required for report generation.
- Operators validate and save OpenAI, Gemini, or Claude keys inside the app.
- Keys and model choices are stored only in IndexedDB on this app origin.

## Local Operation

- Install with `npm install`
- Run with `npm run dev`
- No build-time API key is required for operator use
- Source-discovered AI Studio link: `https://ai.studio/apps/drive/1_QwDgCpDEfZ3WrFFZ4BCbjZo974Q5dVn`
