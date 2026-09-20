# Continue in Codex

You are taking over a substantially implemented GenLayer project named **Abscene**.

Do not replace the project with a different concept. Do not turn it into a contract-only submission. Do not add a second Intelligent Contract.

The repository must remain a **full dApp with exactly one deployable GenLayer Intelligent Contract**:

`contracts/abscene.py`

Target repository:

`https://github.com/BeatyXO/Abscene.git`

Target network:

- GenLayer StudioNet only
- chain ID 61999
- RPC `https://studio.genlayer.com/api`
- explorer `https://explorer-studio.genlayer.com`

## Product boundary

Abscene freezes an event definition, occurrence rule, observation window and public source universe. After the window closes, validators inspect those exact sources. The model classifies source coverage and occurrence only; deterministic contract logic derives:

- OBSERVED
- NOT_OBSERVED
- INCONCLUSIVE
- EXTERNAL_FAILURE

The most important design distinction is PRECOMMITTED vs RETROSPECTIVE.

Only a case sealed before its window begins can produce a `NOT_OBSERVED` result that satisfies `can_rely_on_absence()`.

Do not weaken this.

## Your job

Inspect the entire repository first. Then finish it to a review-ready, live-proven state.

1. Install Python and frontend dependencies.
2. Run:
   - `python -m py_compile contracts/abscene.py`
   - `python scripts/preflight.py`
   - `pytest -q`
   - `genvm-lint check contracts/abscene.py`
   - any current GenVM validation/typecheck command supported by the installed tooling
3. Fix every real runtime, Direct Mode, lint, serialization, ABI, SDK or TypeScript problem you find.
4. Preserve one deployable contract only.
5. Run the frontend typecheck and production build.
6. Add a generated `frontend/package-lock.json` after successful install.
7. Deploy the exact final `contracts/abscene.py` source to StudioNet 61999.
8. Record:
   - canonical contract address
   - deployment transaction
   - finalization status
   - source commit
   - SHA-256 of the deployed contract source
9. Prove source parity between the GitHub source and deployed source.
10. Execute live finalized proof cases for all important branches:
    - OBSERVED
    - PRECOMMITTED + NOT_OBSERVED with `can_rely_on_absence() == true`
    - RETROSPECTIVE + NOT_OBSERVED with `can_rely_on_absence() == false`
    - INCONCLUSIVE from incomplete/unknown mandatory coverage
    - EXTERNAL_FAILURE from a failing mandatory source, followed by a successful retry with the same definition hash
11. Use small, stable, publicly accessible HTTPS evidence sources for live proof. Do not invent transactions, validator votes, addresses or results.
12. Save exact live evidence under `docs/`, preferably machine-readable JSON plus a human-readable `docs/LIVE_EVIDENCE.md`.
13. Update README, BUILD_STATUS and docs/SUBMISSION.md with only actually observed live facts.
14. Set the canonical contract address in the frontend via environment configuration. Keep the source default empty so a missing environment never silently points to a fake deployment.
15. Deploy the frontend to Vercel if authenticated tooling is available. If Vercel authentication is unavailable, leave precise deployment instructions and do not fabricate a URL.
16. Re-run every local quality gate after live-proof changes.
17. Push all completed work to `main`.

## Workspace status (2026-09-20)

The source commit `050613bd383ea6a705850306fbf9db33ba2b3314` was deployed to StudioNet 61999 and Explorer confirms the deployment is `FINALIZED`, with GenVM `SUCCESS` and consensus `Accepted`. Contract: `0x5402F3B8c999945f36a5e76395aC71b7f66dF024`; deployment transaction: `0x16fce2914ce39a3300dd4ad246fb4e6f59265c10123a1425295605a18ded4fab`; source SHA-256: `c8ee61f82a98a5dd40929737f169bdbd5bc1ada5ae2f6bef68ca8336f7962df1`. The public GitHub `main` source blob was independently hashed and matches. Thirty-four Direct Mode tests passed, frontend typecheck/build passed, and static GenVM lint passed; GenVM SDK semantic validation/schema/typecheck previously hit Windows `WinError 5`. Live lifecycle cases remain outstanding. The user will deploy the frontend through Vercel using the env values in README. Push evidence updates to the existing `main` branch; do not claim lifecycle proof until corresponding finalized transactions and contract readback are recorded.

## Security and reviewer requirements

- Keep nondeterministic web/LLM work inside the GenLayer nondeterministic boundary.
- Validators must independently rederive state-driving classifications.
- Do not compare or trust arbitrary explanatory prose.
- Do not let the LLM choose the final receipt.
- Mandatory source failure must never become NOT_OBSERVED.
- PARTIAL/UNKNOWN mandatory coverage must never become NOT_OBSERVED.
- Semantic ambiguity must remain fail-closed.
- INCONCLUSIVE must remain terminal; do not add a reroll-until-favorable path.
- EXTERNAL_FAILURE may retry without mutating the definition.
- Retrospective NOT_OBSERVED must never satisfy the strong absence gate.
- Preserve prompt-injection separation between protocol instructions and untrusted source/user data.
- No backend may become canonical state.
- No fake UI data, transaction hashes, validator counts or deployment claims.

## Quality target

Treat EviFix-level repository rigor as the benchmark for tests, docs, failure handling, live evidence and reviewer clarity, but do not copy EviFix's patching architecture. Abscene must remain its own observation/non-occurrence primitive.

When finished, report:
- final HEAD
- exact test counts
- lint/typecheck/build results
- contract address
- deployment transaction
- source SHA-256
- live proof case IDs and transaction hashes
- frontend URL if actually deployed
- anything still unverified
