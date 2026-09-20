# StudioNet live evidence

## Canonical deployment

- Network: GenLayer StudioNet, chain ID `61999` (`0xF22F`)
- Contract: [`0x5402F3B8c999945f36a5e76395aC71b7f66dF024`](https://explorer-studio.genlayer.com/address/0x5402F3B8c999945f36a5e76395aC71b7f66dF024)
- Deployment transaction: [`0x16fce2914ce39a3300dd4ad246fb4e6f59265c10123a1425295605a18ded4fab`](https://explorer-studio.genlayer.com/tx/0x16fce2914ce39a3300dd4ad246fb4e6f59265c10123a1425295605a18ded4fab)
- Explorer status: `FINALIZED`; GenVM `SUCCESS`; consensus `Accepted`
- Deployed source commit: `050613bd383ea6a705850306fbf9db33ba2b3314`
- `contracts/abscene.py` SHA-256: `c8ee61f82a98a5dd40929737f169bdbd5bc1ada5ae2f6bef68ca8336f7962df1`
- Source parity: verified

The deployed contract source remains unchanged.

## Verified live cases

### Case 2 — OBSERVED

- Mode: `RETROSPECTIVE`
- Outcome/status: `OBSERVED / FINAL`
- Source: `OK / COMPLETE / IN_WINDOW`
- `is_observed=true`; `receipt_matches=true`
- Resolve tx: `0xa7eefe52ef198250543d1843f3aca6e433560867b132b92696d8d6aff77da6c3`

### Case 3 — INCONCLUSIVE

- Mode: `RETROSPECTIVE`
- Outcome/status: `INCONCLUSIVE / FINAL`
- Source: `OK / PARTIAL / NONE`
- `can_rely_on_absence=false`; `receipt_matches=true`
- Resolve tx: `0xe5f6bcb704f1d7700b500b8b8bafc69689da08596a875e4463fc4a60c8e085f0`

### Case 4 — RETROSPECTIVE NOT_OBSERVED

- Mode: `RETROSPECTIVE`
- Outcome/status: `NOT_OBSERVED / FINAL`
- Source: `OK / COMPLETE / NONE`
- `strong_absence_receipt=false`
- `can_rely_on_absence=false`; `receipt_matches=true`
- Resolve tx: `0xb4f1fea85581fd748750aca20cffddd5a6093beb06cb9ef560303ac64a7f9d8c`

### Cases 1 and 5 — EXTERNAL_FAILURE / retry

The mandatory SEC EDGAR source was unavailable, so both cases correctly failed closed with `UNAVAILABLE / UNKNOWN / AMBIGUOUS` and `EXTERNAL_FAILURE / RETRYABLE`. Case 5 reached `attempt_count=2` with unchanged definition hash `65785507711528dbe9505a8b47146d51c26cbc5ead651a96b96d254eaa453c32`. Early retries were rejected by the retry-delay guard. The external endpoint remained unavailable, so recovery-to-final is not demonstrated.

### Case 6 — PRECOMMITTED strong NOT_OBSERVED

This completes Abscene's central live proof on the canonical deployment.

- Title: `Precommitted Apple Q2 publication-window check`
- Creator: `0x15222A8B856552334536461482b1c8c52AEe4A38`
- Mode: `PRECOMMITTED`
- Status: `FINAL`
- Outcome: `NOT_OBSERVED`
- Attempt count: `1`
- Strong absence receipt: `true`
- Source: Apple FY25 Q2 official release
- Source URL: `https://www.apple.com/newsroom/2025/05/apple-reports-second-quarter-results/`
- Source class: `OFFICIAL_LOG`
- Mandatory: `true`
- Fetch: `OK`
- Coverage: `COMPLETE`
- Occurrence: `OUTSIDE_ONLY`
- `can_rely_on_absence(...)`: `true`
- `receipt_matches(...)`: `true`
- Definition hash: `03b3b49624844581159b5135c387df0b5d03902aa63558ce00e8add07971697c`
- Resolution hash: `ed59d0066976cf3baec15a77564f1037a3dd78031509ca2007b2f191ec02f04f`
- Receipt hash: `f2580b0ec498964c9a6a701c6f697a662d4417b35f6f57c750e11dae003f846b`
- Create tx: `0x496c7c3052a4bcd8d70b63a443c7561ceffa66133e499b2b7774b64e34d21ff4`
- Add-source tx: `0x1a0ef7dd236c3edb70a16374ffe49bd1ed3278ef9f3c5448ae35ae536dbdd264`
- Seal tx: `0x6811849780e9396ae396703cd64536fb246d5d8f9839a5da34125fd35711f128`
- Resolve tx: [`0xeb5c41353f656644507ae134ec7cee73793b9f7dfaf2ca2a09d2e120d73843f4`](https://explorer-studio.genlayer.com/tx/0xeb5c41353f656644507ae134ec7cee73793b9f7dfaf2ca2a09d2e120d73843f4)

The source page visibly identifies the named Apple fiscal Q2 2025 results release outside the frozen future observation window. Validators classified the exact official page `COMPLETE` for that named-release/date question and `OUTSIDE_ONLY`; deterministic contract logic therefore finalized `NOT_OBSERVED`. Because the source universe was sealed before the window, the typed strong-absence gate returned true.

## Proof provenance

- Precommitted proof workflow run: `35544048010`
- Workflow conclusion: `success`
- Workflow head: `87ac6a0015ee83cd8786d9d39bc5cbd2166b9d6e`
- Artifact: `abscene-precommit-proof`
- Artifact ID: `10616536516`
- Artifact SHA-256: `c3002c00d7518e9cfb4317914fc4beb56ea1e10a17ae7ea5e2539abfa3bbd853`
- Artifact generated: `2026-09-20T23:33:41.868Z`

Earlier multi-case readback workflow: `35543751011`; artifact `abscene-live-readback`; digest `sha256:0d2d4f6e28f328705d1676839bba2bff62da5d500ab16f7d8935b852d6d20e4b`.

## Quality evidence

The normal Quality workflow verifies Python syntax/preflight, GenVM lint and ABI schema, 25 Direct Mode contract tests + 9 static/source tests, frontend typecheck, and production build.

## Source and receipt boundary

The deployed source is unchanged from the recorded deployment hash. Its semantic prompt marks user/source material as untrusted; validators independently re-fetch and rederive bounded classifications, and deterministic contract code derives the final outcome. Exact fetched response bytes are intentionally not treated as an immutable content archive because public pages can change or differ harmlessly between validators.