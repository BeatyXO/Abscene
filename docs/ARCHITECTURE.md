# Architecture

## Product boundary

Abscene is a full application with exactly one Intelligent Contract. The browser is an operator and reviewer interface; canonical state lives in `contracts/abscene.py`.

The contract is intentionally not an escrow, truth oracle, dispute court, chronology comparator, source-independence graph or policy-upgrade gate. It answers one question:

> Within a frozen observation universe and time window, did a qualifying event appear?

## State objects

### ObservationCase

A case binds:

- creator;
- title;
- event definition;
- occurrence rule;
- optional disambiguating context;
- start/end timestamps;
- source IDs;
- mandatory-source count;
- precommitment mode;
- lifecycle state;
- outcome;
- definition, resolution and receipt hashes;
- attempt count and retry timing.

### ObservationSource

A source binds:

- case ID;
- human label;
- exact HTTPS URL;
- source class;
- explicit coverage rule;
- mandatory/optional role;
- immutable source-definition hash; and
- latest consensus-backed fetch/coverage/occurrence classifications.

## Source classes

`OFFICIAL_LOG`, `OFFICIAL_FEED`, `PUBLIC_REGISTRY`, `SEARCH_INDEX` and `OTHER`.

`OTHER` can only be supporting evidence. It cannot be mandatory for a negative receipt.

Source class alone never proves complete coverage. Validators must still determine whether the visible material supports the frozen coverage rule across the requested window.

## Precommitment

`seal_case()` computes the immutable definition hash.

If sealing occurs before `window_start`, mode is `PRECOMMITTED`. Otherwise mode is `RETROSPECTIVE`.

The distinction cannot be selected by the user and cannot be changed later.

## Nondeterministic boundary

`resolve_case()` enters one `run_nondet_unsafe` boundary.

Each validator:

1. fetches the same exact frozen URLs;
2. assigns a fetch code;
3. sends only successfully fetched bounded content into one constrained semantic classification prompt;
4. normalizes model output to fixed coverage and occurrence enums; and
5. compares only the arrays that drive state.

The classifier prompt explicitly marks the event text, occurrence rule, context, source URLs, coverage rules and fetched content as untrusted data. Source payload JSON preserves embedded newlines so instruction-like content remains visibly inside the source data object rather than being merged into protocol instructions.

The prompt labels event text, occurrence rules, coverage rules, URLs and fetched source content as untrusted data. All source bodies share one semantic context in this version, so a malicious source could attempt cross-source influence even though it cannot directly select the outcome. The contract limits this by freezing each source definition, delimiting the data, accepting only bounded enums, independently re-deriving classifications in validators, and deriving the final outcome deterministically. Per-source model calls would reduce cross-source influence but alter consensus behavior and increase cost/failure surface; it is not introduced without a dedicated protocol revision and live parity testing.

## Deterministic boundary

After consensus returns, deterministic code derives the result.

Positive occurrence is existential: one supported `IN_WINDOW` classification is enough.

Negative occurrence is universal across mandatory sources: every mandatory source must be fetched, have `COMPLETE` coverage and avoid an ambiguous in-window event.

This asymmetry is intentional. Proving one occurrence is easier than supporting bounded absence.

## Retry model

Only `EXTERNAL_FAILURE` is retryable.

A retry:

- keeps the definition hash unchanged;
- cannot add or remove sources;
- cannot change event semantics;
- cannot change the time window; and
- is rate-limited and capped.

`INCONCLUSIVE` is terminal. Semantic ambiguity cannot be rerolled until a favorable model answer appears.

## Receipt bindings

`definition_hash` commits the case and source universe.

`resolution_hash` commits the attempt's source classifications and derived outcome.

`receipt_hash` commits the definition hash, resolution hash, mode, window and final outcome.

Fetched body bytes are intentionally not included in the receipt. Public pages are dynamic, and validators can receive harmless byte-level differences from the same URL; requiring exact-byte agreement could make valid observations brittle or prevent consensus. The receipt instead binds the frozen source universe and the consensus-backed bounded classifications/outcome. It does not claim to be a durable archive or cryptographic proof of the exact bytes served; applications needing archival provenance should preserve independently timestamped source snapshots outside this contract and treat them as supplementary evidence.

Downstream consumers can use:

- `is_observed(...)`;
- `can_rely_on_absence(...)`; or
- `receipt_matches(...)`.

`can_rely_on_absence()` requires a finalized, precommitted `NOT_OBSERVED` result.
