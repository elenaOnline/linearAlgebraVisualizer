# GOAL_PROMPT.md

A meta-document for the human operator. Contains a ready-to-paste goal prompt
(generalized for any development cycle on this project) and notes on choices
worth making deliberately.

The verification loop described here is also embedded in `CLAUDE.md §9` and
`dev/PROTOCOL.md`, so agents working within the repository follow it without
needing this file.

---

## Ready-to-paste goal prompt

Replace `{{SCOPE}}` with a plain-language description of what this run should
accomplish (e.g. "complete Phase 3 polish per CLAUDE.md §8", "implement dark mode
per the style guide", "add an eigenvectors concept module").

```
Work on the Linear Algebra Visualizer in this repository.

Scope of this run:
{{SCOPE}}

Source of truth:
- Read CLAUDE.md and SPEC.md in full before writing any code. SPEC.md defines
  what to build and how it will be judged; CLAUDE.md defines how to build it.
  Follow both. If something is genuinely unspecified, choose the most
  mathematically honest option and record the decision in STATUS.md.

Before starting:
- Read dev/BACKLOG.md and dev/ACTIVE.md to understand what is pending and
  in-flight. Do not duplicate in-progress work.
- When you begin a task, move it from BACKLOG to ACTIVE. When you finish,
  move it to dev/DONE.md.

Build approach:
- If the scope involves a new concept module, follow the Phase 2 parallelizable
  pattern in CLAUDE.md §8: one isolated folder under src/concepts/, one registry
  entry, no changes to shared code without routing through the main agent.
- If the scope touches shared code (scene/, ui/, linalg/), do it sequentially
  and freeze updated contracts in CONTRACTS.md before any parallelization.
- Keep all mathematics and geometry in pure, unit-tested functions; the
  React/Three layer only renders (CLAUDE.md §6.3).
- Commit after each completed task or concept so the run has rollback points.

Completion condition (hard gate — the scope is NOT complete until this passes):
- After the work, spawn a FRESH, independent verification subagent that did not
  write any of the code in this run. Give it only SPEC.md and the verbatim
  product description from SPEC.md section 1. Instruct it to evaluate the
  application critically but fairly, strictly against those documents — it must
  not invent new requirements, and it must separate blocking spec violations
  from non-blocking subjective preferences.
- The verifier must itself run: npm install, npm run build, npm run test,
  npm run lint. Any failure is blocking.
- The verifier must check every item in SPEC.md section 7 (Definition of Done)
  and return either PASS or a numbered list of concrete, spec-referenced gaps.
- If the verdict is not PASS: fix every listed gap, then spawn ANOTHER fresh
  verification subagent and repeat. Loop until a fresh verifier returns PASS.
- Cap the loop at 5 verify-fix cycles. If it still fails after 5, stop, do not
  declare completion, and write the remaining gaps to STATUS.md under "Blockers".

The scope is complete only when a fresh, independent verification subagent
returns PASS against SPEC.md and the product description.
```

---

## Why each piece is here — and what you might otherwise miss

- **Point the run at the docs, not a paraphrase.** The prompt stays short because
  `CLAUDE.md` and `SPEC.md` carry the detail. If you restate requirements in the
  goal prompt instead, you now have two slightly different sources — `SPEC.md`
  must remain authoritative.

- **The `{{SCOPE}}` placeholder is the only thing that changes per run.** The
  verification loop, agent-coordination rules, objective gates, and PASS/gap/fix
  structure are constant. Changing them per run risks weakening the gate.

- **Read the tracker before starting.** `dev/BACKLOG.md` and `dev/ACTIVE.md`
  prevent a new run from duplicating work or conflicting with something already
  in flight. The prompt makes this mandatory.

- **The verifier must be *fresh* and *independent* each cycle.** An agent that
  wrote the code will rate its own work generously. Each verification cycle must
  be a new subagent with no stake in the code. The prompt states this explicitly —
  without it, "have a subagent verify" collapses into self-review.

- **Verification must be iterative, not one-shot.** "A subagent verifies, then
  the run is done" fails the first time the verifier finds a gap. The
  fix-and-reverify loop is what makes one run realistic. The cap (5 cycles) keeps
  a stuck run from looping forever.

- **Objective gates before subjective review.** `install` / `build` / `test` /
  `lint` either pass or they don't — make the verifier run them. This stops a
  run from being declared done while broken, and anchors subjective review on a
  working build.

- **"Critically but fairly" needs a definition of "fairly."** Tell the verifier
  to judge only against `SPEC.md` and the description, not to add requirements,
  and to separate blocking spec violations from nice-to-haves. Otherwise a
  conscientious verifier can move the goalposts indefinitely.

- **A verifier cannot see pixels.** It reviews code, runs builds, and runs tests.
  `SPEC.md` is written so correctness is verifiable from code and tests (math and
  geometry are pure tested functions; tests assert real-time wiring). Plan to do
  the final *visual* judgment yourself by running `npm run dev` — the verifier
  guarantees structural and mathematical correctness, not aesthetics.

- **The run executes on your machine.** Have **Node.js 18+** and npm installed.

- **Scope is fixed by SPEC.md section 7.** The Non-goals list (eigenvalues,
  deployment, etc.) is there so the run does not over-build and the verifier does
  not flag their absence. Future features can be added via the registry pattern —
  `CLAUDE.md §11`.

- **The verification protocol also lives in the repo.** `CLAUDE.md §9` and
  `dev/PROTOCOL.md` describe the same gate. Agents working interactively (without
  a pasted goal prompt) follow those. This file is the operator's entry point;
  those files are the agent's standing instructions.

## Optional additions you may want

- Paste the relevant `dev/BACKLOG.md` items into the scope line so the run
  knows exactly which items to finish.
- Ask for a short `README.md` with setup/run instructions if one does not exist.
- If you want a specific visual style (color palette, light/dark), point the run
  at `Style Guide.html` in the project root — the spec deliberately leaves
  aesthetics open except where the style guide resolves them.
