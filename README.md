# Abscene

**Consensus-backed observation receipts for bounded non-occurrence claims on GenLayer.**

| Submission fact | Verified value |
|---|---|
| Network | GenLayer StudioNet, chain ID `61999` |
| Canonical contract | [`0x5402F3B8c999945f36a5e76395aC71b7f66dF024`](https://explorer-studio.genlayer.com/address/0x5402F3B8c999945f36a5e76395aC71b7f66dF024) |
| Deployment transaction | [`0x16fce2914ce39a3300dd4ad246fb4e6f59265c10123a1425295605a18ded4fab`](https://explorer-studio.genlayer.com/tx/0x16fce2914ce39a3300dd4ad246fb4e6f59265c10123a1425295605a18ded4fab) |
| Deployed source SHA-256 / parity | `c8ee61f82a98a5dd40929737f169bdbd5bc1ada5ae2f6bef68ca8336f7962df1` / verified |
| Local quality | 25 Direct Mode + 9 static tests passing (34 total); frontend typecheck/build passing |
| Live lifecycle proofs | OBSERVED, INCONCLUSIVE, retrospective NOT_OBSERVED, PRECOMMITTED NOT_OBSERVED with strong absence gate, and EXTERNAL_FAILURE/retry verified |
| Production frontend | [https://abscene.vercel.app/](https://abscene.vercel.app/) |

There is exactly one deployable Intelligent Contract: `contracts/abscene.py`. `NOT_OBSERVED` is bounded evidence for the frozen source universe and window; it does **not** mean the event definitely never happened.

Abscene is a full GenLayer application built around **one Intelligent Contract**. A user freezes a precisely defined event, an occurrence rule, an observation time window, a bounded set of public sources, and a coverage rule for each source. After the window closes, GenLayer validators independently inspect those exact sources. Deterministic contract logic derives `OBSERVED`, `NOT_OBSERVED`, `INCONCLUSIVE`, or `EXTERNAL_FAILURE`.

## Why this needs GenLayer

A deterministic smart contract can freeze URLs, timestamps, hashes and state transitions, but it cannot safely decide whether a source covers the full observation window, whether a page contains a qualifying event, whether timing is in-window, or whether ambiguity is sufficient for a negative conclusion. Abscene puts those semantic classifications through validator consensus; deterministic contract logic remains the authority for the final receipt.

## Precommitted vs retrospective

A `PRECOMMITTED` case seals its source universe before the observation window begins. A finalized `NOT_OBSERVED` result can satisfy `can_rely_on_absence(case_id, definition_hash, receipt_hash)`. A `RETROSPECTIVE` negative can never satisfy that gate.

Live case 6 proves the strong path on the canonical deployment: `PRECOMMITTED`, `FINAL`, `NOT_OBSERVED`, source `OK / COMPLETE / OUTSIDE_ONLY`, `strong_absence_receipt=true`, `can_rely_on_absence=true`, and `receipt_matches=true`. Definition hash: `03b3b49624844581159b5135c387df0b5d03902aa63558ce00e8add07971697c`. Receipt hash: `f2580b0ec498964c9a6a701c6f697a662d4417b35f6f57c750e11dae003f846b`. Resolve transaction: [`0xeb5c41353f656644507ae134ec7cee73793b9f7dfaf2ca2a09d2e120d73843f4`](https://explorer-studio.genlayer.com/tx/0xeb5c41353f656644507ae134ec7cee73793b9f7dfaf2ca2a09d2e120d73843f4).

## Deterministic outcome rules

1. Any fetched source with `IN_WINDOW` → `OBSERVED`.
2. Otherwise, any failed mandatory source → `EXTERNAL_FAILURE`.
3. Otherwise, any mandatory source without `COMPLETE` coverage → `INCONCLUSIVE`.
4. Otherwise, any mandatory source with `AMBIGUOUS` occurrence → `INCONCLUSIVE`.
5. Otherwise → `NOT_OBSERVED`.

## One-contract architecture

There is exactly one deployable Intelligent Contract: `contracts/abscene.py`. The React/Vite frontend, tests, docs, preflight script and quality workflow support that contract; there is no companion target, escrow, registry contract or backend authority.

## Network and production

Abscene targets GenLayer StudioNet only.

- Chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- Explorer: `https://explorer-studio.genlayer.com`
- Currency: `GEN`

The canonical deployment is finalized and Explorer verified. Deployed source commit: `050613bd383ea6a705850306fbf9db33ba2b3314`. Deployed source SHA-256: `c8ee61f82a98a5dd40929737f169bdbd5bc1ada5ae2f6bef68ca8336f7962df1`.

Production frontend: [https://abscene.vercel.app/](https://abscene.vercel.app/).

## Verified live evidence

The canonical contract demonstrates:

- case 2: `OBSERVED`, `OK / COMPLETE / IN_WINDOW`, typed observed gate true;
- case 3: `INCONCLUSIVE`, `OK / PARTIAL / NONE`;
- case 4: retrospective `NOT_OBSERVED`, `can_rely_on_absence=false`;
- cases 1 and 5: fail-closed `EXTERNAL_FAILURE`; case 5 proves retry-delay enforcement and a second state-changing attempt under the unchanged definition hash;
- case 6: `PRECOMMITTED`, `FINAL`, `NOT_OBSERVED`, `OK / COMPLETE / OUTSIDE_ONLY`, `strong_absence_receipt=true`, `can_rely_on_absence=true`, `receipt_matches=true`.

The case-6 proof was produced by successful GitHub Actions run `35544048010`; artifact `abscene-precommit-proof` has SHA-256 `c3002c00d7518e9cfb4317914fc4beb56ea1e10a17ae7ea5e2539abfa3bbd853`. Exact evidence is recorded in [`docs/LIVE_EVIDENCE.md`](docs/LIVE_EVIDENCE.md) and [`docs/studionet-lifecycle.json`](docs/studionet-lifecycle.json).

## Quality

The project quality suite covers 25 Direct Mode contract tests + 9 static/source tests (34 total), GenVM lint/schema, frontend typecheck, and production build. See [`BUILD_STATUS.md`](BUILD_STATUS.md).

## Submission thesis

Abscene is not a general truth oracle. It is a reusable observation primitive for systems that need to know whether a well-defined event appeared within a precommitted public observation universe. Potential consumers include disclosure monitors, governance notice systems, release-condition gates, public registries, SLA observers, compliance workflows and autonomous agents that need a bounded machine-readable negative observation rather than an unsupported claim that "nothing happened."