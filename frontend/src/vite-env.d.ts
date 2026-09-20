/// <reference types="vite/client" />
interface ImportMetaEnv { readonly VITE_CONTRACT_ADDRESS?: string; readonly VITE_EXPLORER_BASE?: string }
interface ImportMeta { readonly env: ImportMetaEnv }
interface Window { ethereum?: { request(args:{method:string;params?:unknown[]|object}):Promise<unknown> } }
