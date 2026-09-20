# Build Status

## Implemented and locally verified

- One deployable Intelligent Contract: `contracts/abscene.py`
- Precommitted and retrospective observation modes derived from seal time
- Bounded immutable public source registry and mandatory/optional coverage rules
- Source fetching and semantic classification inside GenLayer nondeterministic execution
- Independent validator re-derivation and deterministic outcome derivation
- Retryable external failure; terminal inconclusive outcomes
- Definition, resolution, and receipt hashes with typed consumer gates
- Full React/Vite frontend with injected wallet connection and StudioNet 61999 checks
- Reviewer case registry, source/result visibility, retry controls, and Explorer links
- 25 passing Direct Mode contract tests + 9 passing static/source tests (34 total)
- CI, preflight checks, and architecture/security/reviewer documentation

## StudioNet deployment

- Canonical contract: `0x5402F3B8c999945f36a5e76395aC71b7f66dF024`
- Deployment transaction: `0x16fce2914ce39a3300dd4ad246fb4e6f59265c10123a1425295605a18ded4fab`
- Explorer finality: `FINALIZED`
- GenVM result: `SUCCESS`
- Consensus result: `Accepted`
- Deployed source commit: `050613bd383ea6a705850306fbf9db33ba2b3314`
- Deployed source SHA-256: `c8ee61f82a98a5dd40929737f169bdbd5bc1ada5ae2f6bef68ca8336f7962df1`
- Source parity: GitHub `main` contract blob has the same SHA-256 and 33,485-byte length; Explorer displays the deployed source.

See [`docs/LIVE_EVIDENCE.md`](docs/LIVE_EVIDENCE.md) and [`docs/studionet-lifecycle.json`](docs/studionet-lifecycle.json) for observed deployment evidence.

## Submission blockers still open

- Finalized live lifecycle proofs for `OBSERVED`, precommitted and retrospective `NOT_OBSERVED`, `INCONCLUSIVE`, and `EXTERNAL_FAILURE` followed by retry
- GenVM SDK semantic validation/typecheck/schema could not complete locally: the installed cache fails with Windows `WinError 5`; the CI GenVM lint step itself passed
- Production frontend deployment and live interaction verification: no Vercel team/project credentials are available in this session, and no production URL is verified
- Finalized StudioNet lifecycle proofs have not been run; the JSON evidence intentionally contains no case records

## Recorded local quality gates

- `python -m py_compile contracts/abscene.py`: pass
- `python scripts/preflight.py`: pass; one deployable contract; chain ID 61999
- `pytest -q`: pass, 34 total (25 Direct Mode contract tests; 9 static/source tests)
- `genvm-lint check contracts/abscene.py`: 3 static lint checks pass; `validate` and `schema` remain blocked locally by inaccessible cached SDK files
- `npm --prefix frontend run typecheck`: pass
- `npm --prefix frontend run build`: pass (Vite warns that the GenLayer client bundle exceeds 500 kB)

Vercel environment values after frontend deployment:

```text
VITE_CONTRACT_ADDRESS=0x5402F3B8c999945f36a5e76395aC71b7f66dF024
VITE_EXPLORER_BASE=https://explorer-studio.genlayer.com
```

Direct Mode pins `sdk_version="v0.2.16"` through the supported `direct_deploy` override. This avoids genlayer-test 0.29.2 resolving `latest` to GenVM rc7, whose release lacks the `genvm-universal.tar.xz` asset expected by that test runner. The v0.2.16 release publishes the expected universal bundle; no tests are skipped or xfailed.
