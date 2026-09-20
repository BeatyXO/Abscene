# StudioNet live evidence

Status: **not yet recorded**. This file intentionally contains no inferred or fabricated deployment data.

The current workspace does not contain Git metadata, the GitHub CLI has no valid authenticated account, and outbound RPC access is blocked in this environment. No canonical deployment or live case transaction has therefore been observed here.

After deploying the exact source to StudioNet chain 61999, append only Explorer verified facts:

- canonical contract address and deployment transaction;
- finality and execution/consensus result;
- source Git commit and `sha256sum contracts/abscene.py`;
- each finalized lifecycle case ID, source IDs, transaction hashes, timestamps, classifications, result and readback;
- `can_rely_on_absence(case_id, definition_hash, receipt_hash)` values for precommitted and retrospective negatives.

Required live cases: `OBSERVED`, precommitted `NOT_OBSERVED`, retrospective `NOT_OBSERVED`, `INCONCLUSIVE`, and `EXTERNAL_FAILURE` followed by a successful retry with the same definition hash.
