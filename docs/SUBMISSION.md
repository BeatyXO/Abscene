# Submission Notes

## One-line description

Abscene is a one-contract GenLayer observation protocol that produces bounded receipts for whether a precisely defined event was observed inside a frozen public source universe and time window.

## Why GenLayer is necessary

The hard part is semantic rather than arithmetic: whether public material provides complete coverage for a requested window, whether a visible item qualifies as the frozen event, and whether its timing falls inside that window.

A deterministic contract cannot reliably interpret arbitrary public pages. A centralized monitor can, but then the monitor becomes the trusted observation authority.

Abscene makes validators independently inspect the frozen sources, while deterministic contract code remains the only authority for the final state.

## Distinguishing mechanisms

- precommitted vs retrospective observation modes derived from seal time;
- source-universe freezing;
- source-specific natural-language coverage rules;
- asymmetric positive vs negative evidence logic;
- `OTHER` sources excluded from mandatory negative coverage;
- first-class `INCONCLUSIVE`;
- infrastructure-only retry path;
- prompt-injection boundary;
- deterministic outcome derivation;
- definition/resolution/receipt hash bindings; and
- a typed `can_rely_on_absence()` downstream interface.

## Reviewer proof target

Before submission, demonstrate five finalized StudioNet cases using the exact canonical deployment:

1. **Observed** — one source contains a clear qualifying event in-window.
2. **Strong not observed** — case sealed before the window, every mandatory source has complete coverage, no qualifying event appears, and `can_rely_on_absence()` returns true.
3. **Inconclusive** — mandatory coverage is partial/unknown or event timing is ambiguous; no negative gate is possible.
4. **Retrospective negative** — result is `NOT_OBSERVED`, while `can_rely_on_absence()` remains false.
5. **External failure + retry** — mandatory source initially fails, case becomes retryable, source later succeeds, definition hash remains unchanged, and the retry finalizes. An `INCONCLUSIVE` proof is required as well.

Also prove:

- chain ID 61999;
- source parity between GitHub and deployed contract;
- finalized deployment transaction;
- one deployable contract only;
- production frontend reads the canonical address; and
- no fake transaction or validator data is rendered by the frontend.

## Current verification status

Direct Mode and frontend quality results are recorded in `BUILD_STATUS.md`. This workspace has no Git metadata, GitHub credentials are invalid, and StudioNet RPC access is blocked. Therefore there is currently no verified contract address, deployment transaction, live lifecycle case, or deployed-source parity record. Do not present the project as live deployed until `docs/LIVE_EVIDENCE.md` contains Explorer/readback facts.
