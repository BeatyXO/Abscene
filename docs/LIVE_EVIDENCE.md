# StudioNet live evidence

## Canonical deployment

- Network: GenLayer StudioNet, chain ID `61999` (`0xF22F`)
- Contract: [`0x5402F3B8c999945f36a5e76395aC71b7f66dF024`](https://explorer-studio.genlayer.com/address/0x5402F3B8c999945f36a5e76395aC71b7f66dF024)
- Deployment transaction: [`0x16fce2914ce39a3300dd4ad246fb4e6f59265c10123a1425295605a18ded4fab`](https://explorer-studio.genlayer.com/tx/0x16fce2914ce39a3300dd4ad246fb4e6f59265c10123a1425295605a18ded4fab)
- Explorer status: `FINALIZED`
- GenVM result: `SUCCESS`
- Consensus result: `Accepted`
- Explorer creation time: `Sep 20, 2026, 10:06:49 PM`
- Deployer: `0xee489567BDC0F52ab858E10a1d568f692135C089`
- Source commit on GitHub `main`: `050613bd383ea6a705850306fbf9db33ba2b3314`
- `contracts/abscene.py` SHA-256: `c8ee61f82a98a5dd40929737f169bdbd5bc1ada5ae2f6bef68ca8336f7962df1`

The contract source was loaded into Studio directly from `contracts/abscene.py`. The public GitHub `main` blob was independently retrieved and hashed: 33,485 bytes with the same SHA-256. The Explorer Contract > Code tab shows the deployed source. This binds the deployment to the source at commit `050613bd383ea6a705850306fbf9db33ba2b3314`.

The StudioNet chain ID was read from `https://studio.genlayer.com/api` as `0xf22f` before deployment.

## Lifecycle cases

No live lifecycle cases have been verified yet. This section will be extended only with finalized transaction hashes and contract readback for each case. The deployment alone does not prove `OBSERVED`, either kind of `NOT_OBSERVED`, `INCONCLUSIVE`, retry behavior, or the `can_rely_on_absence()` gate.

Required live branches still to run:

- `OBSERVED`
- precommitted `NOT_OBSERVED` with `can_rely_on_absence(...) == true`
- retrospective `NOT_OBSERVED` with `can_rely_on_absence(...) == false`
- `INCONCLUSIVE`
- `EXTERNAL_FAILURE` followed by a successful retry with the same definition hash

Add case IDs, source IDs, transaction hashes, finalized classifications, timestamps, hashes, and typed-read results to `docs/studionet-lifecycle.json` after Explorer and contract readback verification.

## Source and receipt boundary

The deployed source is unchanged from the recorded deployment hash. Its single semantic prompt includes bounded content from fetched sources, with all user/source text explicitly marked untrusted; validators independently re-fetch and rederive bounded classifications, and deterministic contract code derives the final outcome. Cross-source influence within that shared context remains a documented residual risk. Exact fetched response bytes are not committed: public pages can change or differ harmlessly between validators, so receipts bind the frozen source definitions and consensus classifications rather than acting as content archives.
