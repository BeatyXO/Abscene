# Submission Notes

## One-line description

Abscene is a one-contract GenLayer observation protocol that produces bounded receipts for whether a precisely defined event was observed inside a frozen public source universe and time window.

## Why GenLayer is necessary

The hard part is semantic rather than arithmetic: whether public material provides complete coverage for a requested window, whether a visible item qualifies as the frozen event, and whether its timing falls inside that window. Abscene makes validators independently inspect frozen sources while deterministic contract code remains the authority for final state.

## Distinguishing mechanisms

- precommitted vs retrospective observation modes derived from seal time;
- source-universe freezing and source-specific coverage rules;
- asymmetric positive vs negative evidence logic;
- first-class `INCONCLUSIVE` and infrastructure-only retry;
- deterministic outcome derivation;
- definition/resolution/receipt hash bindings; and
- typed `can_rely_on_absence()` downstream interface.

## Current verification status

Canonical StudioNet contract: `0x5402F3B8c999945f36a5e76395aC71b7f66dF024`.

Deployment transaction `0x16fce2914ce39a3300dd4ad246fb4e6f59265c10123a1425295605a18ded4fab` is `FINALIZED`, GenVM `SUCCESS`, consensus `Accepted`. Deployed source commit is `050613bd383ea6a705850306fbf9db33ba2b3314`; source SHA-256/parity is `c8ee61f82a98a5dd40929737f169bdbd5bc1ada5ae2f6bef68ca8336f7962df1`.

Live StudioNet evidence verifies:

1. `OBSERVED` — case 2, source `OK / COMPLETE / IN_WINDOW`, observed typed gate true.
2. Strong `NOT_OBSERVED` — case 6, `PRECOMMITTED`, `FINAL`, source `OK / COMPLETE / OUTSIDE_ONLY`, `strong_absence_receipt=true`, `can_rely_on_absence=true`, `receipt_matches=true`.
3. `INCONCLUSIVE` — case 3, mandatory coverage `PARTIAL` and no negative gate.
4. Retrospective negative — case 4, `NOT_OBSERVED` with `can_rely_on_absence=false`.
5. External failure/retry mechanics — cases 1 and 5 fail closed when the mandatory SEC endpoint is unavailable; case 5 proves retry delay enforcement and a second state-changing attempt with the same definition hash. Recovery-to-final is not demonstrated because the external endpoint remained unavailable.

Case 6 exact hashes:

- definition: `03b3b49624844581159b5135c387df0b5d03902aa63558ce00e8add07971697c`
- resolution: `ed59d0066976cf3baec15a77564f1037a3dd78031509ca2007b2f191ec02f04f`
- receipt: `f2580b0ec498964c9a6a701c6f697a662d4417b35f6f57c750e11dae003f846b`
- resolve tx: `0xeb5c41353f656644507ae134ec7cee73793b9f7dfaf2ca2a09d2e120d73843f4`

The strong proof was captured by successful GitHub Actions run `35544048010`; artifact `abscene-precommit-proof` digest is `sha256:c3002c00d7518e9cfb4317914fc4beb56ea1e10a17ae7ea5e2539abfa3bbd853`.

The quality suite is 25 Direct Mode contract tests + 9 static/source tests (34 total), plus GenVM lint/schema and frontend typecheck/build. Production frontend: https://abscene.vercel.app/.

Exact transactions, classifications and hashes are recorded in `docs/LIVE_EVIDENCE.md` and `docs/studionet-lifecycle.json`.

## Readiness

The previously outstanding PRECOMMITTED strong-negative branch is now verified live. No known submission blocker remains. `contracts/abscene.py` was not changed during evidence finalization.