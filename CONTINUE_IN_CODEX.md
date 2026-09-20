# Continue in Codex

You are taking over a substantially implemented GenLayer project named **Abscene**.

Repository: https://github.com/BeatyXO/Abscene.git

Do not return only a plan. Inspect the entire repository first, then finish it in-place and push completed work to `main`.

## Hard product boundary

Abscene is a **full dApp** with exactly **one deployable Intelligent Contract**:

`contracts/abscene.py`

Do not add a second Intelligent Contract. Do not remove the frontend.

Network is GenLayer **StudioNet only**:
- chain ID 61999
- RPC https://studio.genlayer.com/api
- explorer https://explorer-studio.genlayer.com

Abscene freezes an event definition, occurrence rule, observation window and source universe. Validators classify source coverage/occurrence. Deterministic contract logic derives OBSERVED, NOT_OBSERVED, INCONCLUSIVE or EXTERNAL_FAILURE.

The key mechanism is PRECOMMITTED vs RETROSPECTIVE. Only a case sealed before its window starts may produce a NOT_OBSERVED receipt that satisfies `can_rely_on_absence()`.

## Finish the build

1. Install Python + frontend dependencies.
2. Run:
   - `python -m py_compile contracts/abscene.py`
   - `python scripts/preflight.py`
   - `pytest -q`
   - `genvm-lint check contracts/abscene.py`
   - any current GenVM validation/typecheck command supported by installed tooling
3. Add/expand Direct Mode coverage to at least 20 meaningful tests if the current suite is smaller. Required cases:
   - precommitted sealing
   - retrospective sealing
   - immutable source universe
   - duplicate source rejection
   - mandatory OTHER rejection
   - invalid/private URL rejection
   - resolve-before-window rejection
   - decisive OBSERVED despite another source failure
   - complete mandatory coverage -> NOT_OBSERVED
   - OUTSIDE_ONLY is not in-window
   - PARTIAL -> INCONCLUSIVE
   - UNKNOWN -> INCONCLUSIVE
   - AMBIGUOUS -> INCONCLUSIVE
   - mandatory fetch failure -> EXTERNAL_FAILURE
   - retry delay
   - successful retry with unchanged definition hash
   - optional source failure does not block a negative receipt
   - malformed model output fails closed
   - validator disagreement rejects
   - retrospective NOT_OBSERVED never satisfies can_rely_on_absence
   - receipt binding/replay checks
   - final case cannot be re-reviewed
4. Fix every real runtime, ABI, GenVM, serialization, Direct Mode, TypeScript and SDK issue. Preserve the design.
5. Run frontend typecheck/build. Commit `frontend/package-lock.json` after successful install.
6. Deploy the exact final `contracts/abscene.py` source to StudioNet 61999.
7. Record canonical:
   - contract address
   - deployment transaction
   - finalization/execution status
   - final Git commit
   - SHA-256 of deployed source
8. Prove source parity.
9. Execute finalized live proof for:
   - OBSERVED
   - PRECOMMITTED + NOT_OBSERVED + can_rely_on_absence=true
   - RETROSPECTIVE + NOT_OBSERVED + can_rely_on_absence=false
   - INCONCLUSIVE
   - EXTERNAL_FAILURE -> successful retry with same definition hash
10. Use stable public HTTPS evidence. Never invent tx hashes, case IDs, validator counts or results.
11. Save exact live evidence under `docs/` as both human-readable Markdown and machine-readable JSON.
12. Set `VITE_CONTRACT_ADDRESS` in deployment environment. Keep the code default empty so missing config never points to a fake contract.
13. Deploy frontend to Vercel if authenticated. If not, leave instructions and do not fabricate a URL.
14. Update README/docs/BUILD_STATUS with only observed facts.
15. Re-run all quality gates and push to `main`.

## Security invariants

- nondeterministic web/LLM work stays inside the GenLayer nondeterministic boundary
- validators independently rederive state-driving classifications
- model does not choose the final receipt
- failed mandatory source cannot become NOT_OBSERVED
- PARTIAL/UNKNOWN mandatory coverage cannot become NOT_OBSERVED
- ambiguity remains fail-closed
- INCONCLUSIVE is terminal; no reroll-until-favorable path
- EXTERNAL_FAILURE may retry without mutating the definition
- retrospective NOT_OBSERVED never satisfies the strong absence gate
- prompt/user/source material remains untrusted data
- no backend becomes canonical state
- no fake UI data or deployment claims

## Quality benchmark

Use EviFix-level rigor for failure handling, tests, documentation, live evidence and reviewer clarity, but do **not** copy EviFix's patching architecture. Abscene must remain an observation/non-occurrence product.

When finished, report final HEAD, test counts, lint/typecheck/build results, contract address, deployment tx, source hash, live proof case IDs/txs, frontend URL if deployed, and anything still unverified.
