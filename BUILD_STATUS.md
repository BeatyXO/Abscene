# Build Status

## Implemented and verified

- One deployable Intelligent Contract: `contracts/abscene.py`
- Precommitted and retrospective observation modes derived from seal time
- Bounded immutable public source registry and mandatory/optional coverage rules
- Source fetching and semantic classification inside GenLayer nondeterministic execution
- Independent validator re-derivation and deterministic outcome derivation
- Retryable external failure; terminal inconclusive outcomes
- Definition, resolution, and receipt hashes with typed consumer gates
- Full React/Vite frontend with injected wallet connection and StudioNet 61999 checks
- Reviewer case registry, source/result visibility, retry controls, and Explorer links
- 25 Direct Mode contract tests + 9 static/source tests (34 total)
- GenVM lint/semantic validation and ABI schema: pass
- Frontend typecheck/build: pass

## StudioNet deployment

- Canonical contract: `0x5402F3B8c999945f36a5e76395aC71b7f66dF024`
- Deployment transaction: `0x16fce2914ce39a3300dd4ad246fb4e6f59265c10123a1425295605a18ded4fab`
- Explorer finality: `FINALIZED`
- GenVM result: `SUCCESS`
- Consensus result: `Accepted`
- Deployed source commit: `050613bd383ea6a705850306fbf9db33ba2b3314`
- Deployed source SHA-256: `c8ee61f82a98a5dd40929737f169bdbd5bc1ada5ae2f6bef68ca8336f7962df1`
- Source parity: verified; `contracts/abscene.py` remains unchanged

## Live lifecycle proof

Verified on the canonical deployment:

- Case 2: `OBSERVED`, source `OK / COMPLETE / IN_WINDOW`, `is_observed() == true`
- Case 3: `INCONCLUSIVE`, source `OK / PARTIAL / NONE`
- Case 4: retrospective `NOT_OBSERVED`, `can_rely_on_absence() == false`
- Case 1: genuine `PRECOMMITTED` case that failed closed as `EXTERNAL_FAILURE` when SEC EDGAR was unavailable
- Case 5: `EXTERNAL_FAILURE` with retry delay enforced, two state-changing attempts, unchanged definition hash, still `RETRYABLE`
- Case 6: `PRECOMMITTED`, `FINAL`, `NOT_OBSERVED`, source `OK / COMPLETE / OUTSIDE_ONLY`, `strong_absence_receipt == true`, `can_rely_on_absence(...) == true`, `receipt_matches(...) == true`

Case 6 resolve tx: `0xeb5c41353f656644507ae134ec7cee73793b9f7dfaf2ca2a09d2e120d73843f4`.

The strong precommitted absence path is therefore proven live. No core lifecycle proof remains outstanding. External-failure recovery to a final state is not demonstrated because the SEC endpoint remained unavailable; retry behavior itself is verified.

## Frontend deployment

Production website: https://abscene.vercel.app/.

Production environment points to the canonical StudioNet contract and Explorer.

## Quality gates

- `python -m py_compile contracts/abscene.py`: pass
- `python scripts/preflight.py`: pass
- `pytest -q`: pass, 34 total
- GenVM lint: pass
- GenVM ABI schema: pass
- frontend typecheck: pass
- frontend production build: pass

## Submission readiness

The previously outstanding strong-negative lifecycle branch is now verified on StudioNet. No known contract, lifecycle-evidence, frontend, or documentation blocker remains. Temporary evidence-runner scripts/workflows are removed after capture; the normal Quality workflow remains the repository gate.