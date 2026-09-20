# Abscene

**Consensus-backed observation receipts for bounded non-occurrence claims on GenLayer.**

| Submission fact | Verified value |
|---|---|
| Network | GenLayer StudioNet, chain ID `61999` |
| Canonical contract | [`0x5402F3B8c999945f36a5e76395aC71b7f66dF024`](https://explorer-studio.genlayer.com/address/0x5402F3B8c999945f36a5e76395aC71b7f66dF024) |
| Deployment transaction | [`0x16fce2914ce39a3300dd4ad246fb4e6f59265c10123a1425295605a18ded4fab`](https://explorer-studio.genlayer.com/tx/0x16fce2914ce39a3300dd4ad246fb4e6f59265c10123a1425295605a18ded4fab) |
| Deployed source SHA-256 / parity | `c8ee61f82a98a5dd40929737f169bdbd5bc1ada5ae2f6bef68ca8336f7962df1` / verified |
| Local quality | 25 Direct Mode + 9 static tests passing (34 total); frontend typecheck/build passing |
| Live lifecycle proofs | OBSERVED, INCONCLUSIVE, retrospective NOT_OBSERVED, and EXTERNAL_FAILURE/retry verified; strong PRECOMMITTED NOT_OBSERVED remains |
| Production frontend | [https://abscene.vercel.app/](https://abscene.vercel.app/) |

There is exactly one deployable Intelligent Contract: `contracts/abscene.py`. `NOT_OBSERVED` is bounded evidence for the frozen source universe and window; it does **not** mean the event definitely never happened.

Abscene is a full GenLayer application built around **one Intelligent Contract**. A user freezes:

- a precisely defined event;
- an explicit rule for what counts as occurrence;
- an observation time window;
- a bounded set of public sources; and
- a coverage rule for each source.

After the window closes, GenLayer validators independently inspect those exact sources. The contract then derives one of four outcomes:

- `OBSERVED`
- `NOT_OBSERVED`
- `INCONCLUSIVE`
- `EXTERNAL_FAILURE`

Abscene deliberately does **not** claim that an event "never happened." A negative receipt means only:

> No qualifying occurrence was observed inside the exact committed source universe and time window under the frozen occurrence and coverage rules.

## Why this needs GenLayer

A deterministic smart contract can freeze URLs, timestamps, hashes and state transitions, but it cannot safely answer whether:

- a source actually covers the full observation window;
- a page contains a qualifying event rather than a teaser or unrelated mention;
- a visible event occurred inside rather than outside the requested window; or
- ambiguous source material is sufficient for a negative conclusion.

Abscene puts only those semantic classifications through validator consensus. **The model never chooses the final contract outcome.** Deterministic contract logic converts source classifications into the final receipt.

## The key distinction: precommitted vs retrospective

Abscene has two observation modes.

### `PRECOMMITTED`

The source universe was sealed **before** the observation window began.

A finalized `NOT_OBSERVED` result in this mode can satisfy:

```text
can_rely_on_absence(case_id, definition_hash, receipt_hash)
```

This is Abscene's strongest negative receipt.

### `RETROSPECTIVE`

The source universe was sealed after the observation window had already begun.

The case can still record `OBSERVED`, `NOT_OBSERVED`, `INCONCLUSIVE`, or `EXTERNAL_FAILURE`, but a retrospective `NOT_OBSERVED` result **never** satisfies `can_rely_on_absence()`.

That prevents a user from choosing convenient sources after seeing what happened and then presenting the result as though the observation universe had been precommitted.

## Deterministic outcome rules

Each source receives bounded classifications:

**Fetch**

- `OK`
- `TRANSIENT_FAILURE`
- `UNAVAILABLE`

**Coverage**

- `COMPLETE`
- `PARTIAL`
- `UNKNOWN`

**Occurrence**

- `IN_WINDOW`
- `OUTSIDE_ONLY`
- `NONE`
- `AMBIGUOUS`

The final outcome is mechanical:

1. Any fetched source with `IN_WINDOW` → `OBSERVED`.
2. Otherwise, any failed **mandatory** source → `EXTERNAL_FAILURE`.
3. Otherwise, any mandatory source without `COMPLETE` coverage → `INCONCLUSIVE`.
4. Otherwise, any mandatory source with `AMBIGUOUS` occurrence → `INCONCLUSIVE`.
5. Otherwise → `NOT_OBSERVED`.

An optional source can prove a positive occurrence, but its failure cannot manufacture uncertainty in a negative receipt. Mandatory sources carry the coverage burden.

## One-contract architecture

There is exactly one deployable Intelligent Contract:

```text
contracts/abscene.py
```

Everything else supports the full project:

```text
frontend/                 React/Vite application
tests/                    Direct Mode + source invariants
docs/                     architecture, security and reviewer material
scripts/preflight.py      submission sanity checks
.github/workflows/        contract + frontend quality gates
```

There is no companion target contract, escrow contract, registry contract or backend authority.

## Network lock

Abscene targets **GenLayer StudioNet only** for this submission:

- Chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- Explorer: `https://explorer-studio.genlayer.com`
- Currency: `GEN`

Do not switch this repository to Studio-dev `61997` or another network without updating the project decision and tests.

## Product flow

```text
create draft
    ↓
add bounded public observation sources
    ↓
seal source universe
    ↓
PRECOMMITTED or RETROSPECTIVE mode is frozen
    ↓
wait until observation window closes
    ↓
validators independently fetch + classify sources
    ↓
contract derives final result
    ↓
definition hash + resolution hash + receipt hash
```

`EXTERNAL_FAILURE` is retryable without mutating the frozen source universe. `INCONCLUSIVE` is terminal: ambiguity is not solved by repeatedly rerolling the same semantic question.

## Frontend

The application includes:

- StudioNet wallet connection;
- case creation;
- observation-window setup;
- source registration and mandatory/optional selection;
- precommitment status;
- case registry;
- per-source coverage and occurrence results;
- retry state;
- definition/resolution/receipt hashes;
- strong absence-receipt indicator; and
- direct Explorer links.

The UI does not fabricate contract state. Before deployment it shows a deployment-pending banner until `VITE_CONTRACT_ADDRESS` is configured.

## Local checks

Python:

```bash
python -m py_compile contracts/abscene.py
python scripts/preflight.py
pytest -q
genvm-lint check contracts/abscene.py
```

Frontend:

```bash
cd frontend
npm install
npm run typecheck
npm run build
```

## Deployment and production configuration

The canonical StudioNet deployment is finalized and Explorer verified:

- Contract: [`0x5402F3B8c999945f36a5e76395aC71b7f66dF024`](https://explorer-studio.genlayer.com/address/0x5402F3B8c999945f36a5e76395aC71b7f66dF024)
- Deployment transaction: [`0x16fce2914ce39a3300dd4ad246fb4e6f59265c10123a1425295605a18ded4fab`](https://explorer-studio.genlayer.com/tx/0x16fce2914ce39a3300dd4ad246fb4e6f59265c10123a1425295605a18ded4fab) (`FINALIZED`, GenVM `SUCCESS`, consensus `Accepted`)
- Deployed source commit: `050613bd383ea6a705850306fbf9db33ba2b3314`
- Deployed source SHA-256: `c8ee61f82a98a5dd40929737f169bdbd5bc1ada5ae2f6bef68ca8336f7962df1`

Live StudioNet readback now verifies: case 2 = `OBSERVED`; case 3 = `INCONCLUSIVE`; case 4 = retrospective `NOT_OBSERVED` with `can_rely_on_absence() == false`; and cases 1/5 = fail-closed `EXTERNAL_FAILURE`, with case 5 proving retry-delay enforcement and two state-changing attempts under an unchanged definition hash. An additional high-value live proof still pending is a `PRECOMMITTED` `NOT_OBSERVED` case with `can_rely_on_absence() == true`; this branch is already covered by Direct Mode tests. See [`docs/LIVE_EVIDENCE.md`](docs/LIVE_EVIDENCE.md). The Direct Mode suite has 25 contract tests; the 9 static/source tests bring the suite to 34, and the latest GitHub Actions quality workflow is green. Production frontend: [https://abscene.vercel.app/](https://abscene.vercel.app/). Its production environment uses:

```text
VITE_CONTRACT_ADDRESS=<canonical StudioNet contract address>
VITE_EXPLORER_BASE=https://explorer-studio.genlayer.com
```

The repository default is deliberately empty. Never use a placeholder address. For Vercel, add both variables under Project Settings → Environment Variables for Production (and Preview if desired), then redeploy. The build uses `frontend/` as the project root; `vercel.json` defines the install/build/output commands from the repository root.

The local quality gates and remaining blockers are tracked in [`BUILD_STATUS.md`](BUILD_STATUS.md). Deployment facts and the live-case verification gap are recorded in [`docs/LIVE_EVIDENCE.md`](docs/LIVE_EVIDENCE.md) and [`docs/studionet-lifecycle.json`](docs/studionet-lifecycle.json). The reviewer flow is in [`docs/REVIEWER_DEMO.md`](docs/REVIEWER_DEMO.md).

## Submission thesis

Abscene is not a general truth oracle. It is a reusable observation primitive for systems that need to know whether a well-defined event appeared within a precommitted public observation universe.

Potential consumers include disclosure monitors, governance notice systems, release-condition gates, public registries, SLA observers, compliance workflows and autonomous agents that need a bounded machine-readable negative observation rather than an unsupported claim that "nothing happened."