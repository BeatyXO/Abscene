import { createClient } from 'genlayer-js'
import { studionet } from 'genlayer-js/chains'

export const CHAIN_ID = 61999
export const CHAIN_HEX = '0xf22f'
export const STUDIO_RPC = 'https://studio.genlayer.com/api'
export const EXPLORER_BASE = import.meta.env.VITE_EXPLORER_BASE || 'https://explorer-studio.genlayer.com'
export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || '') as `0x${string}`

export const readClient = createClient({ chain: studionet })
export type WalletClient = ReturnType<typeof createClient>

export function contractConfigured() {
  return /^0x[a-fA-F0-9]{40}$/.test(CONTRACT_ADDRESS)
}

export function explorerTx(hash: string) {
  return `${EXPLORER_BASE}/tx/${hash}`
}

export function explorerAddress(address = CONTRACT_ADDRESS) {
  return `${EXPLORER_BASE}/address/${address}`
}

function provider() {
  return window.ethereum
}

function validAddress(value: unknown): value is `0x${string}` {
  return typeof value === 'string' && /^0x[a-fA-F0-9]{40}$/.test(value)
}

export async function ensureStudioNet(p: NonNullable<Window['ethereum']>) {
  const chain = String(await p.request({ method: 'eth_chainId' })).toLowerCase()
  if (chain === CHAIN_HEX) return
  try {
    await p.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN_HEX }] })
  } catch (error: unknown) {
    const code = typeof error === 'object' && error !== null && 'code' in error
      ? Number((error as { code?: unknown }).code)
      : undefined
    if (code !== 4902) throw error
    await p.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: CHAIN_HEX,
        chainName: 'GenLayer StudioNet',
        rpcUrls: [STUDIO_RPC],
        nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
        blockExplorerUrls: [EXPLORER_BASE],
      }],
    })
    await p.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN_HEX }] })
  }
}

export async function connectWallet() {
  const p = provider()
  if (!p) throw new Error('No injected EIP-1193 wallet found.')
  const requested = await p.request({ method: 'eth_requestAccounts' })
  const accounts = Array.isArray(requested) ? requested : []
  const address = accounts.find(validAddress)
  if (!address) throw new Error('Wallet did not expose a valid account.')
  await ensureStudioNet(p)
  const client = createClient({ chain: studionet, account: address, provider: p })
  return { address, client }
}

export async function authorizedWallet() {
  const p = provider()
  if (!p) return null
  const result = await p.request({ method: 'eth_accounts' })
  const accounts = Array.isArray(result) ? result : []
  const address = accounts.find(validAddress)
  if (!address) return null
  const chain = String(await p.request({ method: 'eth_chainId' })).toLowerCase()
  if (chain !== CHAIN_HEX) return { address, client: null }
  return { address, client: createClient({ chain: studionet, account: address, provider: p }) }
}

export async function readContract<T>(functionName: string, args: unknown[] = []): Promise<T> {
  if (!contractConfigured()) throw new Error('VITE_CONTRACT_ADDRESS is not configured.')
  return await readClient.readContract({
    address: CONTRACT_ADDRESS,
    functionName,
    args: args as never[],
  }) as T
}

type StudioTx = {
  statusName?: string
  status?: number
  result_name?: string
  consensus_data?: {
    leader_receipt?: Array<{
      mode?: string
      execution_result?: string
      result?: { status?: string } | string
    }>
  }
}

export async function transactionState(hash: string) {
  try {
    const tx = await readClient.getTransaction({ hash: hash as `0x${string}` & { length: 66 } }) as unknown as StudioTx
    const final = tx.statusName === 'FINALIZED' || tx.status === 7
    if (!final) return { state: 'pending' as const, tx }
    const leader = tx.consensus_data?.leader_receipt?.find((r) => r.mode === 'leader')
      ?? tx.consensus_data?.leader_receipt?.[0]
    const modelStatus = leader?.result && typeof leader.result === 'object'
      ? leader.result.status
      : undefined
    const ok = tx.result_name === 'MAJORITY_AGREE'
      && leader?.execution_result === 'SUCCESS'
      && (modelStatus === undefined || modelStatus === 'return')
    return { state: ok ? 'success' as const : 'failed' as const, tx }
  } catch {
    return { state: 'pending' as const, tx: undefined }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function submitAndFinalize(
  client: WalletClient,
  functionName: string,
  args: unknown[] = [],
  onHash?: (hash: string) => void,
) {
  if (!contractConfigured()) throw new Error('VITE_CONTRACT_ADDRESS is not configured.')
  const hash = String(await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName,
    args: args as never[],
    value: 0n,
  }))
  onHash?.(hash)

  for (let attempt = 0; attempt < 72; attempt += 1) {
    const status = await transactionState(hash)
    if (status.state === 'success') return hash
    if (status.state === 'failed') {
      throw new Error('Transaction finalized without successful execution. Open the transaction in Studio Explorer for the exact receipt.')
    }
    await sleep(2500)
  }
  throw new Error('Transaction was submitted but did not finalize during this browser session. Refresh the case from StudioNet before retrying.')
}
