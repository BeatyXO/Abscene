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
- GitHub Actions quality workflow: green
- GenVM lint/semantic validation: pass
- GenVM ABI schema: pass, 11 methods
- Frontend typecheck/build: pass

## StudioNet deployment

- Canonical contract: `0x5402F3B8c999945f36a5e76395aC71b7f66dF024`
- Deployment transaction: `0x16fce2914ce39a3300dd4ad246fb4e6f59265c10123a1425295605a18ded4fab`
- Explorer finality: `FINALIZED`
- GenVM result: `SUCCESS`
- Consensus result: `Accepted`
- Deployed source commit: `050613bd383ea6a705850306fbf9db33ba2b3314`
- Deployed source SHA-256: `c8ee61f82a98a5dd40929737f169bdbd5bc1ada5ae2f6bef68ca8336f7962df1`
- Source parity: verified; current contract blob remains unchanged

## Live lifecycle proof

Verified on the canonical deployment:

- Case 2: `OBSERVED`, source `OK / COMPLETE / IN_WINDOW`, `is_observed() == true`
- Case 3: `INCONCLUSIVE`, source `OK / PARTIAL / NONE`
- Case 4: retrospective `NOT_OBSERVED`, `can_rely_on_absence() == false`
- Case 1: genuine `PRECOMMITTED` case that failed closed as `EXTERNAL_FAILURE` when SEC EDGAR was unavailable
- Case 5: `EXTERNAL_FAILURE` with retry delay enforced, two state-changing attempts, unchanged definition hash, still `RETRYABLE`

See [`docs/LIVE_EVIDENCE.md`](docs/LIVE_EVIDENCE.md) and [`docs/studionet-lifecycle.json`](docs/studionet-lifecycle.json).

## Submission blocker still open

Only one core lifecycle branch is still missing:

- **PRECOMMITTED + NOT_OBSERVED + `can_rely_on_absence(...) == true`**

A successful external-failure recovery to a final state would strengthen the reviewer package, but the retry mechanism itself is already proven live and fully covered by Direct Mode.

## Frontend deployment

GitHub reports the Vercel deployment status for the current project as `success`. The public production URL and real browser interaction against the canonical contract still need to be recorded before the submission form's required Website field is finalized.

Production environment:

```text
VITE_CONTRACT_ADDRESS=0x5402F3B8c999945f36a5e76395aC71b7f66dF024
VITE_EXPLORER_BASE=https://explorer-studio.genlayer.com
```

## Quality gates

- `python -m py_compile contracts/abscene.py`: pass
- `python scripts/preflight.py`: pass
- `pytest -q`: pass, 34 total
- `GENVM_VERSION=v0.2.16 genvm-lint check contracts/abscene.py`: pass
- `GENVM_VERSION=v0.2.16 genvm-lint schema contracts/abscene.py`: pass
- `npm --prefix frontend run typecheck`: pass
- `npm --prefix frontend run build`: pass
- GitHub Actions: pass

Direct Mode pins `sdk_version="v0.2.16"` because that release provides the universal bundle expected by `genlayer-test 0.29.2`. No tests are skipped or xfailed.
