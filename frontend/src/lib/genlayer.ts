import { createClient } from 'genlayer-js'
import { studionet } from 'genlayer-js/chains'

export const CHAIN_ID = 61999
export const CHAIN_HEX = '0xf22f'
export const RPC = 'https://studio.genlayer.com/api'
export const EXPLORER = import.meta.env.VITE_EXPLORER_BASE || 'https://explorer-studio.genlayer.com'
export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS || '') as `0x${string}`

export const readClient = createClient({ chain: studionet })
export type WalletClient = ReturnType<typeof createClient>

export function configured() {
  return /^0x[a-fA-F0-9]{40}$/.test(CONTRACT_ADDRESS)
}

export async function connectWallet() {
  if (!window.ethereum) throw new Error('No injected EIP-1193 wallet found.')
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[]
  const address = accounts?.[0]
  if (!/^0x[a-fA-F0-9]{40}$/.test(address || '')) throw new Error('Wallet did not expose a valid account.')
  const current = String(await window.ethereum.request({ method: 'eth_chainId' })).toLowerCase()
  if (current !== CHAIN_HEX) {
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN_HEX }] })
    } catch (error: any) {
      if (error?.code !== 4902) throw error
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: CHAIN_HEX,
          chainName: 'GenLayer StudioNet',
          rpcUrls: [RPC],
          nativeCurrency: { name: 'GEN', symbol: 'GEN', decimals: 18 },
          blockExplorerUrls: [EXPLORER],
        }],
      })
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CHAIN_HEX }] })
    }
  }
  return {
    address,
    client: createClient({ chain: studionet, account: address as `0x${string}`, provider: window.ethereum }),
  }
}

export async function readContract<T>(functionName: string, args: unknown[] = []): Promise<T> {
  if (!configured()) throw new Error('VITE_CONTRACT_ADDRESS is not configured.')
  return await readClient.readContract({
    address: CONTRACT_ADDRESS,
    functionName,
    args: args as never[],
  }) as T
}

export async function writeContract(client: WalletClient, functionName: string, args: unknown[] = []) {
  if (!configured()) throw new Error('VITE_CONTRACT_ADDRESS is not configured.')
  return String(await client.writeContract({
    address: CONTRACT_ADDRESS,
    functionName,
    args: args as never[],
  }))
}

export function explorerAddress(address = CONTRACT_ADDRESS) { return `${EXPLORER}/address/${address}` }
export function explorerTx(hash: string) { return `${EXPLORER}/tx/${hash}` }
