# Abscene

**Consensus-backed observation receipts for bounded non-occurrence claims on GenLayer.**

Abscene is a full GenLayer dApp with exactly **one Intelligent Contract**. Users freeze a precisely defined event, an occurrence rule, an observation window, and a bounded public source universe. After the window closes, validators independently inspect those exact sources and the contract deterministically derives:

- `OBSERVED`
- `NOT_OBSERVED`
- `INCONCLUSIVE`
- `EXTERNAL_FAILURE`

A negative receipt never means an event was impossible or "never happened anywhere." It means no qualifying occurrence was observed inside the exact committed source universe and time window.

## Core distinction

### PRECOMMITTED
The source universe was sealed before the observation window began.

Only a finalized precommitted `NOT_OBSERVED` result can satisfy:

`can_rely_on_absence(case_id, definition_hash, receipt_hash)`

### RETROSPECTIVE
The source universe was sealed after the observation window had already started.

It can still record a bounded observation result, but a retrospective negative result can never masquerade as a precommitted absence receipt.

## Why GenLayer

A deterministic contract can freeze URLs, timestamps, hashes and state transitions. It cannot safely decide whether a source covers an entire observation window, whether a visible item qualifies as the frozen event, or whether its timing falls inside the requested window.

Abscene puts only those semantic classifications through validator consensus. The model **does not choose the final state**. Contract logic derives the outcome from bounded per-source classifications.

## Outcome derivation

Each source gets:

- fetch: `OK | TRANSIENT_FAILURE | UNAVAILABLE`
- coverage: `COMPLETE | PARTIAL | UNKNOWN`
- occurrence: `IN_WINDOW | OUTSIDE_ONLY | NONE | AMBIGUOUS`

The result is mechanical:

1. any fetched `IN_WINDOW` source → `OBSERVED`
2. otherwise any failed mandatory source → `EXTERNAL_FAILURE`
3. otherwise incomplete/unknown mandatory coverage → `INCONCLUSIVE`
4. otherwise ambiguous mandatory occurrence → `INCONCLUSIVE`
5. otherwise → `NOT_OBSERVED`

## Project shape

- `contracts/abscene.py` — the only deployable GenLayer contract
- `frontend/` — React/Vite dApp
- `tests/` — Direct Mode and static checks
- `docs/` — architecture/security/submission material
- `scripts/preflight.py` — submission sanity checks

## StudioNet lock

- Chain ID: **61999**
- RPC: `https://studio.genlayer.com/api`
- Explorer: `https://explorer-studio.genlayer.com`

## Current status

The implementation scaffold is built and pushed. Live StudioNet deployment is **not claimed yet**.

Still required before submission:

1. install GenLayer test/lint tooling
2. run full Direct Mode + GenVM lint
3. deploy the exact final source to StudioNet 61999
4. prove live `OBSERVED`, precommitted `NOT_OBSERVED`, `INCONCLUSIVE`, and `EXTERNAL_FAILURE → retry`
5. configure `VITE_CONTRACT_ADDRESS`
6. deploy frontend
7. record source parity, finality, contract address and tx hashes

See `CONTINUE_IN_CODEX.md`.
