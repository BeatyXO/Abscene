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

The canonical StudioNet contract is deployed at `0x5402F3B8c999945f36a5e76395aC71b7f66dF024`. Explorer reports deployment transaction `0x16fce2914ce39a3300dd4ad246fb4e6f59265c10123a1425295605a18ded4fab` as `FINALIZED`, GenVM `SUCCESS`, and consensus `Accepted`. The deployed source commit is `050613bd383ea6a705850306fbf9db33ba2b3314`, and source parity was checked against the public GitHub `main` blob by SHA-256.

The five live lifecycle branches above have **not** yet been demonstrated. Do not present the project as lifecycle-proven until each finalized case transaction, source classification, receipt hash, and typed readback is recorded in `docs/LIVE_EVIDENCE.md` and `docs/studionet-lifecycle.json`. Local Direct Mode and frontend checks are recorded in `BUILD_STATUS.md`.
