import { FormEvent, useEffect, useState } from 'react'
import { configured, connectWallet, explorerAddress, readContract, writeContract, type WalletClient } from './lib/genlayer'
import './styles.css'

type Case = {
  case_id:number; creator:string; title:string; event_definition:string; occurrence_rule:string;
  context:string; window_start:number; window_end:number; status_name:string; mode_name:string;
  outcome_name:string; source_ids:number[]; mandatory_source_count:number; definition_hash:string;
  resolution_hash:string; receipt_hash:string; attempt_count:number; retry_after:number; strong_absence_receipt:boolean;
}
type Source = {
  source_id:number; label:string; url:string; source_class_name:string; coverage_rule:string; mandatory:boolean;
  fetch_name:string; coverage_name:string; occurrence_name:string; reviewed_at:number;
}

const fmt=(x:number)=>x?new Date(x*1000).toLocaleString():'—'
const short=(x:string)=>x?x.slice(0,10)+'…'+x.slice(-8):'—'

export default function App(){
  const [wallet,setWallet]=useState(''); const [client,setClient]=useState<WalletClient|null>(null)
  const [cases,setCases]=useState<Case[]>([]); const [selected,setSelected]=useState<Case|null>(null)
  const [sources,setSources]=useState<Source[]>([]); const [msg,setMsg]=useState(''); const [busy,setBusy]=useState('')
  const [view,setView]=useState<'home'|'create'|'cases'>('home')
  const [form,setForm]=useState({title:'',event:'',rule:'',context:'',start:'',end:''})
  const [sourceForm,setSourceForm]=useState({label:'',url:'',sourceClass:1,coverage:'',mandatory:true})

  async function loadCases(){
    if(!configured()) return
    const count=Number(await readContract<number>('get_case_count'))
    const ids=Array.from({length:Math.min(count,50)},(_,i)=>count-i).filter(Boolean)
    const rows=await Promise.all(ids.map(id=>readContract<Case>('get_case',[id])))
    setCases(rows); if(!selected&&rows[0]) setSelected(rows[0])
  }
  useEffect(()=>{loadCases().catch(e=>setMsg(String(e)))},[])
  useEffect(()=>{ if(!selected||!configured()){setSources([]);return}
    Promise.all(selected.source_ids.map(id=>readContract<Source>('get_source',[id]))).then(setSources).catch(e=>setMsg(String(e)))
  },[selected?.case_id,selected?.attempt_count,selected?.outcome_name])

  async function connect(){try{const w=await connectWallet();setWallet(w.address);setClient(w.client)}catch(e){setMsg(e instanceof Error?e.message:String(e))}}
  async function tx(label:string,fn:string,args:unknown[]){
    if(!client){await connect();return}
    setBusy(label); setMsg('')
    try{const hash=await writeContract(client,fn,args);setMsg(label+' submitted: '+hash);await loadCases()}
    catch(e){setMsg(e instanceof Error?e.message:String(e))} finally{setBusy('')}
  }
  async function create(e:FormEvent){e.preventDefault();await tx('Create case','create_case',[form.title,form.event,form.rule,form.context,Math.floor(new Date(form.start).getTime()/1000),Math.floor(new Date(form.end).getTime()/1000)]);setView('cases')}
  async function addSource(e:FormEvent){e.preventDefault();if(!selected)return;await tx('Add source','add_source',[selected.case_id,sourceForm.label,sourceForm.url,sourceForm.sourceClass,sourceForm.coverage,sourceForm.mandatory])}

  return <div className="app">
    <header>
      <button className="brand" onClick={()=>setView('home')}><b>A</b><span><strong>Abscene</strong><small>observation receipts</small></span></button>
      <nav><button onClick={()=>setView('home')}>Overview</button><button onClick={()=>setView('create')}>Create</button><button onClick={()=>setView('cases')}>Cases</button></nav>
      <div className="wallet"><span>● StudioNet 61999</span><button onClick={connect}>{wallet?wallet.slice(0,6)+'…'+wallet.slice(-4):'Connect wallet'}</button></div>
    </header>

    {!configured()&&<div className="banner"><b>Deployment pending.</b> Set <code>VITE_CONTRACT_ADDRESS</code> after the one contract is deployed to StudioNet 61999.</div>}
    {msg&&<div className="notice">{msg}</div>}

    <main>
      {view==='home'&&<section className="home">
        <p className="eyebrow">Consensus-backed observation</p>
        <h1>Prove what the committed sources <em>didn’t show.</em></h1>
        <p className="lead">Abscene freezes an event, a time window and a public source universe. After the window closes, GenLayer validators inspect those exact sources and the contract derives a bounded observation receipt.</p>
        <div className="actions"><button className="primary" onClick={()=>setView('create')}>Create observation</button><button onClick={()=>setView('cases')}>Open registry</button></div>
        <div className="boundary"><article><b>PRECOMMITTED</b><h3>Strong absence receipt</h3><p>The source universe was sealed before the window opened. A finalized NOT_OBSERVED result can satisfy <code>can_rely_on_absence()</code>.</p></article><article><b>RETROSPECTIVE</b><h3>Historical observation only</h3><p>No qualifying occurrence was found, but the case cannot masquerade as a precommitted negative proof.</p></article></div>
      </section>}

      {view==='create'&&<section className="create"><div><p className="eyebrow">New observation</p><h2>Define the event before you define the evidence.</h2><p>Seal the source universe before the observation window starts to earn PRECOMMITTED status.</p></div>
        <form onSubmit={create}>
          <label>Title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
          <label>Event definition<textarea required value={form.event} onChange={e=>setForm({...form,event:e.target.value})}/></label>
          <label>What counts as occurrence?<textarea required value={form.rule} onChange={e=>setForm({...form,rule:e.target.value})}/></label>
          <label>Context<textarea value={form.context} onChange={e=>setForm({...form,context:e.target.value})}/></label>
          <div className="split"><label>Window starts<input type="datetime-local" required value={form.start} onChange={e=>setForm({...form,start:e.target.value})}/></label><label>Window ends<input type="datetime-local" required value={form.end} onChange={e=>setForm({...form,end:e.target.value})}/></label></div>
          <button className="primary" disabled={!!busy}>{busy||'Create draft'}</button>
        </form>
      </section>}

      {view==='cases'&&<section className="cases">
        <aside><h2>Observation cases</h2>{cases.map(c=><button className={selected?.case_id===c.case_id?'active':''} key={c.case_id} onClick={()=>setSelected(c)}><small>#{c.case_id} · {c.status_name}</small><strong>{c.title}</strong><span>{c.mode_name} · {c.outcome_name}</span></button>)}</aside>
        <div className="detail">{!selected?<p>Select a case.</p>:<>
          <div className="title"><div><p className="eyebrow">Case #{selected.case_id}</p><h2>{selected.title}</h2></div><div className="pills"><span>{selected.mode_name}</span><span>{selected.status_name}</span></div></div>
          <div className="result"><b>{selected.outcome_name}</b><p>{selected.strong_absence_receipt?'Strong precommitted absence receipt.':selected.outcome_name==='NOT_OBSERVED'?'Retrospective negative observation; strong absence gate is false.':'Result is bounded to this source universe and time window.'}</p></div>
          <div className="cards"><article><small>EVENT</small><p>{selected.event_definition}</p></article><article><small>OCCURRENCE RULE</small><p>{selected.occurrence_rule}</p></article><article><small>WINDOW</small><p>{fmt(selected.window_start)} → {fmt(selected.window_end)}</p></article></div>

          {wallet&&wallet.toLowerCase()===selected.creator.toLowerCase()&&selected.status_name==='DRAFT'&&<form className="sourceForm" onSubmit={addSource}>
            <input placeholder="Source label" required value={sourceForm.label} onChange={e=>setSourceForm({...sourceForm,label:e.target.value})}/>
            <input placeholder="https://..." required value={sourceForm.url} onChange={e=>setSourceForm({...sourceForm,url:e.target.value})}/>
            <select value={sourceForm.sourceClass} onChange={e=>setSourceForm({...sourceForm,sourceClass:Number(e.target.value),mandatory:Number(e.target.value)===5?false:sourceForm.mandatory})}><option value={1}>Official log</option><option value={2}>Official feed</option><option value={3}>Public registry</option><option value={4}>Search index</option><option value={5}>Other/supporting</option></select>
            <textarea placeholder="Coverage rule for the full observation window" required value={sourceForm.coverage} onChange={e=>setSourceForm({...sourceForm,coverage:e.target.value})}/>
            <label className="check"><input type="checkbox" disabled={sourceForm.sourceClass===5} checked={sourceForm.mandatory} onChange={e=>setSourceForm({...sourceForm,mandatory:e.target.checked})}/> required for negative coverage</label>
            <button disabled={!!busy}>{busy||'Add source'}</button>
          </form>}

          <div className="sources">{sources.map(s=><article key={s.source_id}><div><strong>{s.label}{s.mandatory?' · required':''}</strong><a href={s.url} target="_blank">{s.source_class_name} ↗</a><p>{s.coverage_rule}</p></div><span>{s.fetch_name}</span><span>{s.coverage_name}</span><span>{s.occurrence_name}</span></article>)}</div>

          <div className="hashes"><div><span>Definition</span><code>{short(selected.definition_hash)}</code></div><div><span>Resolution</span><code>{short(selected.resolution_hash)}</code></div><div><span>Receipt</span><code>{short(selected.receipt_hash)}</code></div></div>
          <div className="actions">{wallet&&wallet.toLowerCase()===selected.creator.toLowerCase()&&selected.status_name==='DRAFT'&&<button className="primary" onClick={()=>tx('Seal case','seal_case',[selected.case_id])}>Seal source universe</button>}{(selected.status_name==='SEALED'||selected.status_name==='RETRYABLE')&&Math.floor(Date.now()/1000)>=selected.window_end&&<button className="primary" onClick={()=>tx('Resolve','resolve_case',[selected.case_id])}>{selected.status_name==='RETRYABLE'?'Retry observation':'Resolve observation'}</button>}</div>
        </>}</div>
      </section>}
    </main>
    <footer><span>Abscene · one Intelligent Contract · StudioNet 61999</span>{configured()&&<a href={explorerAddress()} target="_blank">Explorer ↗</a>}</footer>
  </div>
}
