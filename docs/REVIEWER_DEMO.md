# Reviewer Demo

## Goal

Show why Abscene is not "AI decides whether something happened."

## 1. Create the precommitted case

Define a narrow event, a clear occurrence rule, and a future observation window.

## 2. Add two sources

Make at least one mandatory source an authoritative log/feed/registry/search index with a defensible full-window coverage rule. Add an optional secondary source.

## 3. Seal before the window starts

Read back:

- `mode_name = PRECOMMITTED`
- `definition_hash`
- immutable source IDs/hashes

## 4. Resolve after the window closes

Show each source's:

- fetch status;
- coverage classification; and
- occurrence classification.

Then show the contract-derived outcome.

## 5. Demonstrate the typed negative gate

For a precommitted `NOT_OBSERVED` result:

```text
can_rely_on_absence(case_id, definition_hash, receipt_hash) == true
```

Create or show a retrospective `NOT_OBSERVED` case with the same semantic result and demonstrate:

```text
can_rely_on_absence(...) == false
```

That contrast is the core product mechanism.

## 6. Show fail-closed behavior

Use a source with incomplete window coverage. The result must be `INCONCLUSIVE`, not a negative receipt.

Use a failing mandatory source. The result must be `EXTERNAL_FAILURE`, then retry the same frozen case after the retry delay.

## 7. Verify hashes

Show definition, resolution and receipt hashes in the UI and on-chain readback.
