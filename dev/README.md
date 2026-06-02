# dev/ — Development Tracking Hub

This directory is the informational hub for ongoing development. It is written
for agents: the format is designed to be parseable and updatable with the
Edit/Write tools across sessions.

---

## Files

| File | Purpose |
|------|---------|
| `README.md` | This file. How to use the tracker. |
| `PROTOCOL.md` | The verification loop procedure — how to run the gate. |
| `BACKLOG.md` | Prioritized list of pending work items. |
| `ACTIVE.md` | Currently in-flight work. |
| `DONE.md` | Completed milestone log (append-only). |
| `PHASE-D-WAVES.md` | Parallel execution plan for B-15–B-25 (problem-log fixes): which items share files, which can run simultaneously, and the gate checkpoints between waves. |

---

## When to read

At the start of every work session, read `BACKLOG.md` and `ACTIVE.md`. This
prevents duplicating work and surfacing conflicts with in-flight changes.

Before running the verification gate, read `PROTOCOL.md`.

---

## When to write

**Starting a task:**
1. Find the item in `BACKLOG.md` and change its `**Status:**` to `active`.
2. Copy the item into `ACTIVE.md` under the "In progress" section, adding:
   - `**Files in scope:**` — list of paths this task will touch
   - `**Next step if interrupted:**` — one sentence so a future agent can resume

**Finishing a task:**
1. Remove the item from the "In progress" section of `ACTIVE.md`.
2. Change its `**Status:**` in `BACKLOG.md` to `done`.
3. Append a brief entry to `DONE.md` (format: date, ID, one-sentence summary,
   gate results if applicable).

**Adding a new task:**
Add it to `BACKLOG.md` following the item format below. Assign the next
sequential ID (B-NN). Choose a priority:
- **P1** — blocking or high-impact; should be done before the next verification
- **P2** — important polish or correctness improvement; do before shipping
- **P3** — nice-to-have; deferred until P1 and P2 are clear

---

## Item format (BACKLOG.md)

```markdown
### [B-NN] Title
**Priority:** P1 | P2 | P3
**Category:** style | performance | feature | polish | infra | docs
**Status:** open | active | done
**Depends on:** [B-NN], [B-NN] | none
**Description:** One sentence describing what needs to change and why.
**Acceptance criteria:**
- Implementer-facing: "I have changed X so that Y is true"
- May include human sign-off steps ("visual result inspected in browser")
**Goal criteria:**
- Critic-facing: must be verifiable from a terminal without opening a browser
- (e.g. "`grep -r 'pattern' src/` returns 0 results", "`npm run build` exits 0")
- No "visually inspect in browser" bullets here — those go in acceptance criteria
```

**Acceptance criteria vs Goal criteria:**
- `**Acceptance criteria:**` — the implementer's checklist. Describes what was done.
  May include human sign-off steps.
- `**Goal criteria:**` — the critic's checklist. Every bullet must be verifiable
  from a terminal or by reading a file: grep patterns, exit codes, file-existence
  checks, or test assertions. A fresh agent with no browser access must be able to
  confirm or deny each one.

---

## Rules

- Never delete entries from `DONE.md` — append only.
- Never reorder `BACKLOG.md` items without also updating their priority field.
- Always update `ACTIVE.md` before stopping mid-task so the next session can resume.
- Do not mark an item done in `DONE.md` until the objective gates (build/test/lint)
  pass with the change in place.
- If a task is blocked, add a **Blocked:** line to the ACTIVE entry with a
  one-sentence description of what is needed to unblock, and record the same in
  `STATUS.md` under "Blockers".
- Every ACTIVE entry must reference a BACKLOG ID. If in-flight work predates the
  tracker, create the BACKLOG item first, then move it to ACTIVE. No floating entries
  without a `[B-NN]` ID.
- Before starting any item, check its `**Depends on:**` field. If any listed item
  is not `done`, complete it first or explicitly document the exception in ACTIVE.md.
