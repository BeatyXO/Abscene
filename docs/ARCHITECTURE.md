# Architecture

Abscene is a full dApp with exactly one Intelligent Contract. The browser is an operator/reviewer interface; canonical state lives in `contracts/abscene.py`.

## State

An ObservationCase freezes event semantics, occurrence rule, context, start/end times, source IDs, precommitment mode and receipt hashes. An ObservationSource freezes an HTTPS URL, source class, mandatory/optional role and an explicit coverage rule.

## Consensus boundary

`resolve_case()` performs source fetches and semantic classification inside one `run_nondet_unsafe` boundary. Validators independently re-run the same reads and classification. Consensus compares only state-driving fetch, coverage and occurrence enums.

## Deterministic boundary

One supported in-window occurrence is enough for `OBSERVED`. A negative receipt is stricter: every mandatory source must fetch successfully, demonstrate `COMPLETE` window coverage and avoid an ambiguous qualifying occurrence.

## Precommitment

Seal time derives the mode. Before window start = `PRECOMMITTED`; otherwise = `RETROSPECTIVE`. Users cannot choose this flag. Only a finalized precommitted `NOT_OBSERVED` can satisfy `can_rely_on_absence()`.

## Retry

Only infrastructure-level `EXTERNAL_FAILURE` retries. The frozen definition cannot change. Semantic `INCONCLUSIVE` is terminal, preventing reroll-until-favorable behavior.
