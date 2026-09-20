import fs from 'node:fs';
import { createAccount, createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

const ADDRESS = '0x5402F3B8c999945f36a5e76395aC71b7f66dF024';
const SOURCE_URL = 'https://www.apple.com/newsroom/2025/05/apple-reports-second-quarter-results/';
const account = createAccount();
const client = createClient({ chain: studionet, account });

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const safe = (value) => {
  if (typeof value === 'bigint') return value.toString();
  if (Array.isArray(value)) return value.map(safe);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, safe(v)]));
  }
  return value;
};

async function read(functionName, args = []) {
  return safe(await client.readContract({ address: ADDRESS, functionName, args }));
}

async function waitSuccessful(hash) {
  for (let attempt = 0; attempt < 240; attempt += 1) {
    try {
      const tx = await client.getTransaction({ hash });
      const final = tx.statusName === 'FINALIZED' || tx.status === 7;
      if (final) {
        const receipts = tx.consensus_data?.leader_receipt;
        const leader = Array.isArray(receipts)
          ? (receipts.find(r => r.mode === 'leader') ?? receipts[0])
          : receipts;
        const resultStatus = leader?.result && typeof leader.result === 'object'
          ? leader.result.status
          : undefined;
        const ok = tx.result_name === 'MAJORITY_AGREE'
          && leader?.execution_result === 'SUCCESS'
          && (resultStatus === undefined || resultStatus === 'return');
        if (!ok) {
          throw new Error('Finalized transaction failed: ' + JSON.stringify({
            statusName: tx.statusName,
            result_name: tx.result_name,
            execution_result: leader?.execution_result,
            result: leader?.result,
          }));
        }
        return safe(tx);
      }
    } catch (error) {
      if (String(error).includes('Finalized transaction failed')) throw error;
    }
    await sleep(2500);
  }
  throw new Error('Timed out waiting for finalization: ' + hash);
}

async function submit(functionName, args) {
  const hash = String(await client.writeContract({
    address: ADDRESS,
    functionName,
    args,
    value: 0n,
  }));
  await waitSuccessful(hash);
  return hash;
}

const beforeCases = Number(await read('get_case_count'));
const beforeSources = Number(await read('get_source_count'));
const base = Math.floor(Date.now() / 1000);
const windowStart = base + 900;
const windowEnd = windowStart + 180;

const txs = {};
txs.create_case = await submit('create_case', [
  'Precommitted Apple Q2 publication-window check',
  "Apple's fiscal 2025 second-quarter results release is published during the specified observation window.",
  'Count the event only if the official Apple Newsroom page states that this named fiscal Q2 2025 results release was published at a date or time inside the exact UTC observation window. If the visible official publication date is outside the window, classify OUTSIDE_ONLY.',
  'This deliberately bounded case asks only whether this one already-identified official Apple release date falls inside the future short window. It makes no claim about other Apple publications.',
  windowStart,
  windowEnd,
]);

const afterCases = Number(await read('get_case_count'));
if (afterCases !== beforeCases + 1) {
  throw new Error(`Unexpected case count change: before=${beforeCases}, after=${afterCases}`);
}
const caseId = afterCases;

txs.add_source = await submit('add_source', [
  caseId,
  'Apple FY25 Q2 official release',
  SOURCE_URL,
  1,
  'This exact official Apple Newsroom page is the complete primary-source document for the named fiscal Q2 2025 results release and visibly identifies its publication date. Use that date only to determine whether this named release falls inside or outside the frozen observation window.',
  true,
]);

const afterSources = Number(await read('get_source_count'));
if (afterSources !== beforeSources + 1) {
  throw new Error(`Unexpected source count change: before=${beforeSources}, after=${afterSources}`);
}
const sourceId = afterSources;

txs.seal_case = await submit('seal_case', [caseId]);
const sealed = await read('get_case', [caseId]);
if (sealed.mode_name !== 'PRECOMMITTED') {
  throw new Error('Case did not seal PRECOMMITTED: ' + JSON.stringify(sealed));
}

const waitMs = Math.max(0, (windowEnd + 8 - Math.floor(Date.now() / 1000)) * 1000);
console.log(JSON.stringify({
  stage: 'sealed',
  case_id: caseId,
  source_id: sourceId,
  mode: sealed.mode_name,
  definition_hash: sealed.definition_hash,
  window_start: windowStart,
  window_end: windowEnd,
  wait_seconds: Math.ceil(waitMs / 1000),
  creator: account.address,
  txs,
}, null, 2));
if (waitMs > 0) await sleep(waitMs);

txs.resolve_case = await submit('resolve_case', [caseId]);
const item = await read('get_case', [caseId]);
const source = await read('get_source', [sourceId]);

let canRely = null;
let receiptMatches = null;
if (item.status_name === 'FINAL' && item.definition_hash && item.receipt_hash) {
  canRely = await read('can_rely_on_absence', [caseId, item.definition_hash, item.receipt_hash]);
  receiptMatches = await read('receipt_matches', [
    caseId,
    item.definition_hash,
    item.resolution_hash,
    item.receipt_hash,
  ]);
}

const output = {
  generated_at: new Date().toISOString(),
  network: 'GenLayer StudioNet',
  chain_id: 61999,
  contract: ADDRESS,
  creator: account.address,
  case_id: caseId,
  source_id: sourceId,
  window_start: windowStart,
  window_end: windowEnd,
  case: item,
  source,
  can_rely_on_absence: canRely,
  receipt_matches: receiptMatches,
  transactions: txs,
  success: item.mode_name === 'PRECOMMITTED'
    && item.status_name === 'FINAL'
    && item.outcome_name === 'NOT_OBSERVED'
    && item.strong_absence_receipt === true
    && canRely === true
    && receiptMatches === true,
};

fs.mkdirSync('artifacts', { recursive: true });
fs.writeFileSync('artifacts/precommit-proof.json', JSON.stringify(output, null, 2));
console.log(JSON.stringify(output, null, 2));

if (!output.success) {
  throw new Error('Strong precommitted absence proof did not reach the required final state.');
}
