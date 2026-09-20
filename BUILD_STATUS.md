# Build Status

## Implemented

- one deployable contract: `contracts/abscene.py`
- precommitted and retrospective observation modes
- bounded source registry
- mandatory/optional coverage semantics
- source fetching inside nondeterministic execution
- structured LLM classification
- independent validator re-derivation
- deterministic final outcome
- retryable external failure
- hash-bound typed receipts
- React/Vite frontend
- injected wallet connection
- StudioNet 61999 lock
- case creation, source management, sealing, resolving and receipt display
- 32 passing GenLayer Direct Mode tests, including prompt-injection, disagreement, retry cap and receipt binding cases
- CI and preflight checks
- reviewer/security/architecture documentation
- machine-readable StudioNet lifecycle evidence template

## Still requires GenLayer-capable runtime / authenticated deployment

- GenVM SDK semantic validation/typecheck/schema (the installed cache fails with Windows `WinError 5`; static lint succeeds)
- deploy canonical source to StudioNet 61999
- execute live semantic lifecycle proof
- record contract/deployment tx/source hash
- deploy frontend
- push verified changes to `main` (workspace is missing `.git`; GitHub CLI authentication is invalid)

## Latest local gates

- `python -m py_compile contracts/abscene.py`: pass
- `python scripts/preflight.py`: pass; one deployable contract; chain ID 61999
- `pytest -q`: pass, 32 tests (GenLayer Direct Mode)
- `genvm-lint check contracts/abscene.py`: 3 static lint checks pass; validation blocked by inaccessible SDK cache
- `npm --prefix frontend run typecheck`: pass
- `npm --prefix frontend run build`: pass (Vite warns the GenLayer client bundle is larger than 500 kB)
- npm install generated `frontend/package-lock.json`

Vercel deployment remains user-run by request. Set `VITE_CONTRACT_ADDRESS` to the verified canonical contract and `VITE_EXPLORER_BASE=https://explorer-studio.genlayer.com` in Vercel Production environment variables, then redeploy.

No live deployment claims are made yet.
