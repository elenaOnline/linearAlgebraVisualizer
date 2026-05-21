# GOAL_PROMPT.md

A meta-document for you, the human operator — not part of the build. It contains a
ready-to-paste goal prompt for Claude Code, and notes on choices worth making
deliberately.

---

## Ready-to-paste goal prompt

```
Build the Linear Algebra Visualizer web application in this repository.

Source of truth:
- Read CLAUDE.md and SPEC.md in full before writing any code. SPEC.md defines
  what to build and how it will be judged; CLAUDE.md defines how to build it.
  Follow both. If something is genuinely unspecified, choose the most
  mathematically honest option and record the decision in STATUS.md.

Build approach:
- Follow the four-phase workflow in CLAUDE.md section 8. Do Phase 1 (foundation)
  sequentially. Use parallel subagents or subagent teams for Phase 2 (the seven
  concept modules), since each concept is an isolated folder depending only on
  the frozen foundation contracts. Brief each subagent with the relevant SPEC.md
  section and the shared component contracts, and forbid subagents from editing
  shared code directly.
- Initialize git early and commit after each phase and each completed concept.
- Keep all mathematics and geometry in pure, unit-tested functions; the
  React/Three layer only renders (CLAUDE.md section 6.3).

Completion condition (this is a hard gate — the goal is NOT complete until it is
met):
- After the build, spawn a FRESH, independent verification subagent that did not
  write any of the code. Give it only SPEC.md and the verbatim product
  description from SPEC.md section 1. Instruct it to evaluate the application
  critically but fairly, strictly against those documents — it must not invent
  new requirements, and it must separate blocking spec violations from
  non-blocking subjective preferences.
- The verifier must itself run: npm install, npm run build, npm run test,
  npm run lint, and npm run dev. Any failure is blocking.
- The verifier must check every item in SPEC.md section 7 (Definition of Done)
  and return either PASS or a numbered list of concrete, spec-referenced gaps.
- If the verdict is not PASS: fix every listed gap, then spawn ANOTHER fresh
  verification subagent and repeat. Loop until a fresh verifier returns PASS.
- Cap the loop at 5 verify-fix cycles. If it still fails after 5, stop, do not
  declare completion, and write the remaining gaps to STATUS.md.

The goal is complete only when a fresh, independent verification subagent
returns PASS against SPEC.md and the product description.
```

## Why each piece is here — and what you might otherwise miss

- **Point the run at the docs, not at a paraphrase.** The goal prompt stays short
  because `CLAUDE.md` and `SPEC.md` carry the detail. If you instead paste the
  whole product description into the goal prompt, keep `SPEC.md` authoritative to
  avoid two slightly different sources.

- **The verifier must be *fresh* and *independent* each cycle.** An agent that
  wrote the code will rate its own work generously. Each verification cycle
  should be a new subagent with no stake in the code. The prompt states this
  explicitly — without it, "have a subagent verify" tends to collapse into
  self-review.

- **Verification must be iterative, not one-shot.** "A subagent verifies, then
  the goal completes" fails the first time the verifier finds a gap. The
  fix-and-reverify loop is what makes one run realistic. The cap (5 cycles) keeps
  a stuck run from looping forever.

- **Objective gates before subjective review.** `install` / `build` / `test` /
  `lint` / `dev` either pass or they don't — make the verifier run them. This
  stops a run from being declared done while broken, and anchors the subjective
  review on a working build.

- **"Critically but fairly" needs a definition of "fairly."** Tell the verifier
  to judge only against `SPEC.md` and the description, to not add requirements,
  and to separate blocking spec violations from nice-to-haves. Otherwise a
  conscientious verifier can move the goalposts indefinitely and the run never
  ends.

- **A verifier cannot see pixels.** It reviews code, runs builds, and runs tests.
  `SPEC.md` is written so correctness is verifiable from code and tests (math and
  geometry are pure tested functions; tests assert real-time wiring). Plan to do
  the final *visual* judgment yourself by running `npm run dev` — the verifier
  guarantees structural and mathematical correctness, not aesthetics.

- **The run executes on your machine.** Unlike a sandbox, a Claude Code goal run
  builds in your local environment. Have **Node.js 18+** and npm installed before
  you start, or Phase 1 will fail immediately.

- **Decide on autonomy and permissions.** A one-run build of this size needs the
  run to install packages and run scripts without stopping for approval on each
  step. Start it with whatever permission mode you are comfortable with for an
  unattended run.

- **Scope is fixed by SPEC.md section 7.** The Non-goals list (eigenvalues,
  deployment, etc.) is there so the run does not over-build and the verifier does
  not flag their absence. Future features can be added later via the registry
  pattern — `CLAUDE.md` section 11.

- **Expect a `STATUS.md`.** The run is instructed to write blockers and any
  unspecified-decision notes there. Check it when the run ends.

## Optional additions you may want

- Ask for a short `README.md` with setup/run instructions (currently the run will
  produce one only if you request it).
- Ask the run to capture a few screenshots of `npm run dev` into a `screenshots/`
  folder, so you have a quick visual record without starting the app yourself.
- If you want a specific visual style (color palette, light/dark), state it in
  the goal prompt — the spec deliberately leaves aesthetics open.
