# Threat Model

## Claim overreach

**Threat:** A user presents `NOT_OBSERVED` as proof an event never happened anywhere.

**Control:** The protocol defines the receipt narrowly against a specific source universe and time window. The frontend repeats that boundary. Retrospective negative observations never satisfy the strong absence gate.

## Post-hoc source selection

**Threat:** A user waits for the window to end, chooses favorable sources, and presents the result as precommitted monitoring.

**Control:** Mode is derived from on-chain seal time. Only sealing before window start produces `PRECOMMITTED`.

## Weak source coverage

**Threat:** An empty or incomplete page is mistaken for evidence of absence.

**Control:** Every mandatory source has an explicit coverage rule. `NOT_OBSERVED` requires `COMPLETE` coverage on every mandatory source. `PARTIAL` or `UNKNOWN` becomes `INCONCLUSIVE`.

## Prompt injection in fetched pages

**Threat:** A page contains instructions aimed at the model.

**Control:** The prompt explicitly treats source content, URLs, event text, context and coverage rules as untrusted data. Consensus compares only bounded classification enums, validators independently rederive those classifications, and deterministic contract code chooses the outcome. In the current version, fetched sources share one semantic prompt, leaving a residual cross-source influence risk. Per-source isolation is a plausible defense-in-depth improvement, but would change the consensus execution/cost/failure surface and is deferred to a separately tested and redeployed protocol revision.

Direct Mode includes a hostile fetched-page fixture that says to return `COMPLETE` and `NONE`; the case remains `INCONCLUSIVE` when the bounded model output is `UNKNOWN`/`AMBIGUOUS`. Newlines from fetched content remain visible in the prompt data encoding.

## Evidence-byte provenance

Receipts bind the frozen definitions, classifications, outcome, resolution hash and receipt hash, not exact fetched response bytes. This avoids making consensus depend on byte-for-byte equality for dynamic public pages. Consequently, a receipt is not an archive or a proof of the exact payload a particular validator received; a consumer needing archival provenance must retain independently timestamped snapshots as supplementary evidence.

## Model authority expansion

**Threat:** The model decides the final state.

**Control:** The model only classifies source coverage and occurrence. Contract code derives the final outcome.

## Source outage

**Threat:** An unavailable mandatory source is interpreted as absence.

**Control:** Mandatory fetch failure becomes `EXTERNAL_FAILURE`, never `NOT_OBSERVED`. This state is retryable without mutating the source universe.

## Rerolling ambiguity

**Threat:** The caller repeats an inconclusive semantic review until a favorable response appears.

**Control:** `INCONCLUSIVE` is terminal. Only infrastructure-level `EXTERNAL_FAILURE` can retry.

## Optional-source griefing

**Threat:** A nonessential corroborating source goes offline and permanently blocks a negative receipt.

**Control:** Optional failures do not degrade negative coverage. However, an available optional source can still establish a positive in-window occurrence.

## Local/private URLs

**Threat:** Source definitions target loopback or obvious private-network resources.

**Control:** Source registration requires HTTPS and rejects common loopback/private ranges and `.local` names. Network-level enforcement still belongs to GenLayer's runtime.

## Receipt substitution

**Threat:** A downstream contract reuses a receipt with a different case definition.

**Control:** Typed read gates require matching definition and receipt hashes. `receipt_matches()` can additionally pin the resolution hash.
