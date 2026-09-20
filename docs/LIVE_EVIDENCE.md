# StudioNet live evidence

## Canonical deployment

- Network: GenLayer StudioNet, chain ID `61999` (`0xF22F`)
- Contract: [`0x5402F3B8c999945f36a5e76395aC71b7f66dF024`](https://explorer-studio.genlayer.com/address/0x5402F3B8c999945f36a5e76395aC71b7f66dF024)
- Deployment transaction: [`0x16fce2914ce39a3300dd4ad246fb4e6f59265c10123a1425295605a18ded4fab`](https://explorer-studio.genlayer.com/tx/0x16fce2914ce39a3300dd4ad246fb4e6f59265c10123a1425295605a18ded4fab)
- Explorer status: `FINALIZED`
- GenVM result: `SUCCESS`
- Consensus result: `Accepted`
- Deployed source commit: `050613bd383ea6a705850306fbf9db33ba2b3314`
- `contracts/abscene.py` SHA-256: `c8ee61f82a98a5dd40929737f169bdbd5bc1ada5ae2f6bef68ca8336f7962df1`
- Source parity: verified against the 33,485-byte GitHub contract blob

The deployed contract source remains unchanged. Current repository commits after deployment modify tests, CI, docs and evidence only.

## Verified live cases

The canonical contract currently contains five cases. Their state was independently read from StudioNet with the GenLayer JS client and correlated with Explorer transactions. Machine-readable details are in [`studionet-lifecycle.json`](studionet-lifecycle.json).

### Case 2 — OBSERVED ✅

**Apple FY2025 Q2 results release**

- Mode: `RETROSPECTIVE`
- Final outcome: `OBSERVED`
- Source: Apple FY25 Q2 official release
- Fetch: `OK`
- Coverage: `COMPLETE`
- Occurrence: `IN_WINDOW`
- `is_observed(...)`: `true`
- `receipt_matches(...)`: `true`
- Resolve tx: [`0xa7eefe52ef198250543d1843f3aca6e433560867b132b92696d8d6aff77da6c3`](https://explorer-studio.genlayer.com/tx/0xa7eefe52ef198250543d1843f3aca6e433560867b132b92696d8d6aff77da6c3)

Definition: `e21feb5b37b34885c6a3adc6c083cca535cf678695c47b330ee847477da8d576`

Receipt: `768382a8e23f5bfd77cb52fea3e36e2f2bba5dfe8c3a49b3a0ed83de50e320a5`

### Case 3 — INCONCLUSIVE ✅

**Apple vehicle announcement in Q2 release**

- Mode: `RETROSPECTIVE`
- Final outcome: `INCONCLUSIVE`
- Fetch: `OK`
- Coverage: `PARTIAL`
- Occurrence: `NONE`
- `can_rely_on_absence(...)`: `false`
- `receipt_matches(...)`: `true`
- Resolve tx: [`0xe5f6bcb704f1d7700b500b8b8bafc69689da08596a875e4463fc4a60c8e085f0`](https://explorer-studio.genlayer.com/tx/0xe5f6bcb704f1d7700b500b8b8bafc69689da08596a875e4463fc4a60c8e085f0)

This proves incomplete mandatory coverage fails closed instead of manufacturing a negative receipt.

### Case 4 — RETROSPECTIVE NOT_OBSERVED ✅

**Apple release headline exact-match check**

- Mode: `RETROSPECTIVE`
- Final outcome: `NOT_OBSERVED`
- Fetch: `OK`
- Coverage: `COMPLETE`
- Occurrence: `NONE`
- Strong absence receipt: `false`
- `can_rely_on_absence(...)`: `false`
- `receipt_matches(...)`: `true`
- Resolve tx: [`0xb4f1fea85581fd748750aca20cffddd5a6093beb06cb9ef560303ac64a7f9d8c`](https://explorer-studio.genlayer.com/tx/0xb4f1fea85581fd748750aca20cffddd5a6093beb06cb9ef560303ac64a7f9d8c)

Definition: `daf6ee9ff96d4f85475cf8099ea0cf15e7b79e1cf253ac19635b944ce89b97bf`

Receipt: `e84076e209acdb92d1b7ab3bd6e8b1d9426403e74074d73fe983711c856edaba`

This proves a retrospective negative cannot masquerade as Abscene's strong precommitted absence receipt.

### Cases 1 and 5 — EXTERNAL_FAILURE / retry behavior ✅ partial recovery proof

Both cases use the mandatory SEC EDGAR Apple 8-K feed. StudioNet validators could not fetch the source, so the contract correctly derived:

- Fetch: `UNAVAILABLE`
- Coverage: `UNKNOWN`
- Occurrence: `AMBIGUOUS`
- Outcome: `EXTERNAL_FAILURE`
- Status: `RETRYABLE`

Case 5 reached `attempt_count = 2` with the same definition hash:

`65785507711528dbe9505a8b47146d51c26cbc5ead651a96b96d254eaa453c32`

Successful state-changing attempts:

- Attempt 1: [`0x7af354bf369a5ff137105f8c3b8a84f9a806601f2b7c88e6715ac983725ec345`](https://explorer-studio.genlayer.com/tx/0x7af354bf369a5ff137105f8c3b8a84f9a806601f2b7c88e6715ac983725ec345)
- Attempt 2: [`0x252cf40d58a65a67df6d4fbd33e0c3b5562e13381522deb72f4250731451d6c7`](https://explorer-studio.genlayer.com/tx/0x252cf40d58a65a67df6d4fbd33e0c3b5562e13381522deb72f4250731451d6c7)

Early retries were rejected with `ABSCENE: retry delay has not elapsed`, proving the delay is enforced. The SEC endpoint remained unavailable, so a recovery-to-final-state transaction has not been demonstrated.

## Remaining live proof

One core proof remains:

**PRECOMMITTED + NOT_OBSERVED + `can_rely_on_absence(...) == true`**

Case 1 is genuinely `PRECOMMITTED`, but its mandatory SEC source was unavailable and therefore correctly became `EXTERNAL_FAILURE`. It cannot serve as the strong-negative proof.

Once a precommitted case with a reachable mandatory source resolves to `NOT_OBSERVED`, Abscene's central live demonstration is complete.

## Quality evidence

Latest GitHub Actions quality run is green:

- Python syntax + preflight: pass
- GenVM lint/semantic validation: pass
- GenVM ABI schema: pass
- 25 Direct Mode contract tests + 9 static/source tests: pass
- frontend typecheck: pass
- frontend production build: pass

## Readback provenance

Live state was read from the public StudioNet contract using `genlayer-js` from a GitHub Actions runner and correlated with the Explorer transaction API.

- Readback workflow run: `35543751011`
- Artifact: `abscene-live-readback`
- Artifact SHA-256: `0d2d4f6e28f328705d1676839bba2bff62da5d500ab16f7d8935b852d6d20e4b`

## Source and receipt boundary

The deployed source is unchanged from the recorded deployment hash. Its semantic prompt marks user/source material as untrusted; validators independently re-fetch and rederive bounded classifications, and deterministic contract code derives the final outcome. Exact fetched response bytes are intentionally not treated as an immutable content archive because public pages can change or differ harmlessly between validators.
