# Project memory

## Product intent & audience

- Project appears to be a **game** (build/run workflow confirmed).
- Intent: runnable, visually previewable game in the Bolt environment.

## Brand personality & voice

- Developer-facing assistant tone: direct, concise, action-oriented.

## Visual design & UX direction

- No explicit visual/UX details yet; game output is viewed via Bolt's preview pane (right side).
- User wants immediate visual feedback from running the build.

## Decisions, constraints & rationale

- Project **builds successfully**; preview runs automatically in Bolt's preview pane.
- Assistant **cannot manually start a preview server**; relies on Bolt's auto-preview.
- Recommended fallback if preview is blank: **reload the preview pane**.
- Workflow: confirm build → preview renders → user reports issues → iterate.

## Open questions & assumptions

- Game type, mechanics, and genre are unknown (not yet specified by user).
- Visual style, assets, and UI preferences not yet established.
- Assuming the user will provide feedback after viewing the preview to guide next edits.
- No explicit `.bolt/prompt` instructions exist yet; relying solely on inferred context.