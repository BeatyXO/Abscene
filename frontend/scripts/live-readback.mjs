import fs from 'node:fs';
import { createClient, decodeLocalnetTransaction } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

const ADDRESS = '0x5402F3B8c999945f36a5e76395aC71b7f66dF024';
const client = createClient({ chain: studionet });

function safe(value) {
  if (typeof value === 'bigint') return value.toString();
  if (Array.isArray(value)) return value.map(safe);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, safe(v)]));
  }
  return value;
}

async function read(functionName, args = []) {
  return safe(await client.readContract({
    address: ADDRESS,
    functionName,
    args,
  }));
}

const count = Number(await read('get_case_count'));
const cases = [];

for (let id = 1; id <= count; id++) {
  const item = await read('get_case', [id]);
  const sourceIds = (item.source_ids ?? item.sourceIds ?? []).map(Number);
  const sources = [];
  for (const sid of sourceIds) {
    sources.push(await read('get_source', [sid]));
  }

  let canRelyOnAbsence = null;
  let isObserved = null;
  let receiptMatches = null;
  if (
    item.status_name === 'FINAL' &&
    item.definition_hash &&
    item.receipt_hash
  ) {
    canRelyOnAbsence = await read('can_rely_on_absence', [
      id,
      item.definition_hash,
      item.receipt_hash,
    ]);
    isObserved = await read('is_observed', [
      id,
      item.definition_hash,
      item.receipt_hash,
    ]);
    if (item.resolution_hash) {
      receiptMatches = await read('receipt_matches', [
        id,
        item.definition_hash,
        item.resolution_hash,
        item.receipt_hash,
      ]);
    }
  }

  cases.push({
    ...item,
    sources,
    can_rely_on_absence_readback: canRelyOnAbsence,
    is_observed_readback: isObserved,
    receipt_matches_readback: receiptMatches,
  });
}

let explorer = { ok: false, transactions: [], error: null };
try {
  const url = `https://studio.genlayer.com/api/explorer/transactions?address=${ADDRESS}&page=1&limit=100`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  const payload = await response.json();
  const txs = [];
  for (const raw of payload.transactions ?? []) {
    let decoded = raw;
    try {
      decoded = decodeLocalnetTransaction(structuredClone(raw));
    } catch {}
    txs.push(safe({
      hash: raw.hash,
      type: raw.type,
      status: raw.status,
      from_address: raw.from_address,
      to_address: raw.to_address,
      created_at: raw.created_at,
      data: decoded.data ?? raw.data,
      consensus_data: decoded.consensus_data ?? raw.consensus_data,
    }));
  }
  explorer = {
    ok: true,
    pagination: payload.pagination ?? null,
    transactions: txs,
    error: null,
  };
} catch (error) {
  explorer = { ok: false, transactions: [], error: String(error) };
}

const output = {
  generated_at: new Date().toISOString(),
  network: 'GenLayer StudioNet',
  chain_id: 61999,
  contract: ADDRESS,
  case_count: count,
  cases,
  explorer,
};

fs.mkdirSync('artifacts', { recursive: true });
fs.writeFileSync('artifacts/live-readback.json', JSON.stringify(output, null, 2));
console.log(JSON.stringify({
  case_count: count,
  cases: cases.map(c => ({
    case_id: c.case_id,
    title: c.title,
    mode_name: c.mode_name,
    status_name: c.status_name,
    outcome_name: c.outcome_name,
    attempt_count: c.attempt_count,
    strong_absence_receipt: c.strong_absence_receipt,
    can_rely_on_absence: c.can_rely_on_absence_readback,
    is_observed: c.is_observed_readback,
    source_ids: c.source_ids,
  })),
  explorer_ok: explorer.ok,
  explorer_tx_count: explorer.transactions.length,
  explorer_error: explorer.error,
}, null, 2));
