import { FormEvent, useEffect, useMemo, useState } from 'react'
import { StatusPill, OutcomeMark } from './components/StatusPill'
import {
  CONTRACT_ADDRESS,
  contractConfigured,
  connectWallet,
  authorizedWallet,
  explorerAddress,
  explorerTx,
  readContract,
  submitAndFinalize,
  type WalletClient,
} from './lib/genlayer'
import type { ObservationCase, ObservationSource } from './types'

type View = 'overview' | 'create' | 'cases'

const SOURCE_CLASSES = [
  { value: 1, label: 'Official log' },
  { value: 2, label: 'Official feed' },
  { value: 3, label: 'Public registry' },
  { value: 4, label: 'Search index' },
  { value: 5, label: 'Other / supporting' },
]

function unixFromLocal(value: string) {
  return Math.floor(new Date(value).getTime() / 1000)
}

function formatDate(value: number) {
  if (!value) return '—'
  return new Date(value * 1000).toLocaleString()
}

function shortHash(value: string) {
  if (!value) return '—'
  return `${value.slice(0, 10)}…${value.slice(-8)}`
}

function addressMatch(a?: string, b?: string) {
  return Boolean(a && b && a.toLowerCase() === b.toLowerCase())
}

function App() {
  const [view, setView] = useState<View>('overview')
  const [wallet, setWallet] = useState('')
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null)
  const [cases, setCases] = useState<ObservationCase[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [sources, setSources] = useState<ObservationSource[]>([])
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')
  const [lastTx, setLastTx] = useState('')
  const [recentTxs, setRecentTxs] = useState<string[]>([])
  const [loadingCases, setLoadingCases] = useState(false)
  const [networkCorrect, setNetworkCorrect] = useState(false)

  const selected = useMemo(
    () => cases.find((item) => item.case_id === selectedId) ?? null,
    [cases, selectedId],
  )

  useEffect(() => {
    authorizedWallet()
      .then((snapshot) => {
        if (!snapshot) return
        setWallet(snapshot.address)
        setNetworkCorrect(Boolean(snapshot.client))
        if (snapshot.client) setWalletClient(snapshot.client)
      })
      .catch(() => undefined)
  }, [])

  async function refreshCases(preselect?: number) {
    if (!contractConfigured()) return
    setLoadingCases(true)
    try {
      const count = Number(await readContract<number>('get_case_count'))
      const ids = Array.from({ length: Math.min(count, 60) }, (_, i) => count - i).filter((x) => x > 0)
      const loaded = await Promise.all(ids.map((id) => readContract<ObservationCase>('get_case', [id])))
      setCases(loaded)
      const next = preselect ?? selectedId
      if (next && loaded.some((item) => item.case_id === next)) setSelectedId(next)
      else if (!selectedId && loaded[0]) setSelectedId(loaded[0].case_id)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not load StudioNet cases.')
    } finally {
      setLoadingCases(false)
    }
  }

  useEffect(() => {
    refreshCases().catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!selected || !contractConfigured()) {
      setSources([])
      return
    }
    Promise.all(selected.source_ids.map((id) => readContract<ObservationSource>('get_source', [id])))
      .then(setSources)
      .catch((error) => setNotice(error instanceof Error ? error.message : 'Could not load sources.'))
  }, [selected?.case_id, selected?.resolved_at, selected?.attempt_count])

  async function onConnect() {
    setNotice('')
    try {
      const connected = await connectWallet()
      setWallet(connected.address)
      setWalletClient(connected.client)
      setNetworkCorrect(true)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Wallet connection failed.')
    }
  }

  async function runWrite(label: string, functionName: string, args: unknown[]) {
    if (!walletClient) throw new Error('Connect a wallet on StudioNet first.')
    setBusy(label)
    setNotice('')
    setLastTx('')
    try {
      const hash = await submitAndFinalize(walletClient, functionName, args, (submitted) => {
        setLastTx(submitted)
        setRecentTxs((current) => [submitted, ...current.filter((value) => value !== submitted)].slice(0, 8))
      })
      setNotice(`${label} finalized successfully.`)
      await refreshCases(selectedId ?? undefined)
      return hash
    } finally {
      setBusy('')
    }
  }

  const finalCount = cases.filter((item) => item.status_name === 'FINAL').length
  const strongCount = cases.filter((item) => item.strong_absence_receipt).length
  const observedCount = cases.filter((item) => item.outcome_name === 'OBSERVED').length

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setView('overview')}>
          <span className="brand-mark">A</span>
          <span>
            <strong>Abscene</strong>
            <small>bounded observation receipts</small>
          </span>
        </button>
        <nav>
          <button className={view === 'overview' ? 'nav-active' : ''} onClick={() => setView('overview')}>Overview</button>
          <button className={view === 'create' ? 'nav-active' : ''} onClick={() => setView('create')}>Create</button>
          <button className={view === 'cases' ? 'nav-active' : ''} onClick={() => setView('cases')}>Cases</button>
        </nav>
        <div className="wallet-area">
          <span className={`network-dot ${networkCorrect ? 'network-ready' : 'network-off'}`} />
          <span className="network-name">{networkCorrect ? 'StudioNet · 61999' : 'StudioNet · switch wallet'}</span>
          <button className="wallet-button" onClick={onConnect}>
            {wallet ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}` : 'Connect wallet'}
          </button>
        </div>
      </header>

      {!contractConfigured() && (
        <div className="setup-banner">
          <strong>Deployment pending.</strong>
          <span>Set <code>VITE_CONTRACT_ADDRESS</code> after deploying the one Abscene contract to StudioNet 61999.</span>
        </div>
      )}

      {notice && (
        <div className="notice">
          <span>{notice}</span>
          <button onClick={() => setNotice('')}>×</button>
        </div>
      )}

      {lastTx && (
        <a className="tx-strip" href={explorerTx(lastTx)} target="_blank" rel="noreferrer">
          Finalized transaction {shortHash(lastTx)} ↗
        </a>
      )}

      {recentTxs.length > 0 && (
        <div className="recent-transactions" aria-label="Recent transactions">
          <span>Recent StudioNet transactions</span>
          {recentTxs.map((hash) => (
            <a key={hash} href={explorerTx(hash)} target="_blank" rel="noreferrer">{shortHash(hash)} ↗</a>
          ))}
        </div>
      )}

      <main>
        {view === 'overview' && (
          <Overview
            total={cases.length}
            finalized={finalCount}
            strong={strongCount}
            observed={observedCount}
            onCreate={() => setView('create')}
            onCases={() => setView('cases')}
          />
        )}

        {view === 'create' && (
          <CreateCase
            busy={busy}
            walletReady={Boolean(walletClient)}
            onConnect={onConnect}
            onCreated={async (args) => {
              await runWrite('Create observation case', 'create_case', args)
              await refreshCases()
              setView('cases')
            }}
          />
        )}

        {view === 'cases' && (
          <section className="cases-layout">
            <aside className="case-list-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Registry</p>
                  <h2>Observation cases</h2>
                </div>
                <button className="icon-button" onClick={() => refreshCases()} disabled={loadingCases}>
                  {loadingCases ? '…' : '↻'}
                </button>
              </div>
              <div className="case-list">
                {cases.length === 0 && <div className="empty">No on-chain cases yet.</div>}
                {cases.map((item) => (
                  <button
                    key={item.case_id}
                    className={`case-row ${selectedId === item.case_id ? 'selected' : ''}`}
                    onClick={() => setSelectedId(item.case_id)}
                  >
                    <div className="case-row-top">
                      <span>#{item.case_id}</span>
                      <StatusPill value={item.status_name} />
                    </div>
                    <strong>{item.title}</strong>
                    <div className="case-row-bottom">
                      <span>{item.mode_name.replace('_', ' ')}</span>
                      <span>{item.outcome_name.replace('_', ' ')}</span>
                    </div>
                  </button>
                ))}
              </div>
            </aside>

            <section className="detail-panel">
              {!selected ? (
                <div className="empty-detail">
                  <span className="orb">○</span>
                  <h2>Select an observation case</h2>
                  <p>Inspect its frozen universe, source coverage and final receipt.</p>
                </div>
              ) : (
                <CaseDetail
                  item={selected}
                  sources={sources}
                  wallet={wallet}
                  busy={busy}
                  onAddSource={async (args) => {
                    await runWrite('Add observation source', 'add_source', [selected.case_id, ...args])
                  }}
                  onSeal={async () => {
                    await runWrite('Seal observation universe', 'seal_case', [selected.case_id])
                  }}
                  onResolve={async () => {
                    await runWrite('Resolve observation', 'resolve_case', [selected.case_id])
                  }}
                />
              )}
            </section>
          </section>
        )}
      </main>

      <footer>
        <span>Abscene · one Intelligent Contract · GenLayer StudioNet</span>
        {contractConfigured() && (
          <a href={explorerAddress()} target="_blank" rel="noreferrer">
            {shortHash(CONTRACT_ADDRESS)} ↗
          </a>
        )}
      </footer>
    </div>
  )
}

function Overview({
  total,
  finalized,
  strong,
  observed,
  onCreate,
  onCases,
}: {
  total: number
  finalized: number
  strong: number
  observed: number
  onCreate: () => void
  onCases: () => void
}) {
  return (
    <section className="overview">
      <div className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Consensus-backed observation</p>
          <h1>Prove what the committed sources <em>didn’t show.</em></h1>
          <p className="hero-lead">
            Abscene freezes an event definition, a time window and a public source universe.
            After the window closes, GenLayer validators inspect those exact sources and the
            contract derives a bounded observation receipt.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={onCreate}>Create observation</button>
            <button className="secondary" onClick={onCases}>Open registry</button>
          </div>
        </div>

        <div className="signal-card">
          <div className="signal-ring">
            <span className="ring-one" />
            <span className="ring-two" />
            <span className="signal-core">∅</span>
          </div>
          <div className="signal-copy">
            <p>Negative result boundary</p>
            <strong>NOT_OBSERVED ≠ never happened</strong>
            <span>It means no qualifying occurrence was found inside the exact committed observation universe.</span>
          </div>
        </div>
      </div>

      <div className="metrics">
        <Metric label="Cases" value={total} />
        <Metric label="Finalized" value={finalized} />
        <Metric label="Strong absence receipts" value={strong} />
        <Metric label="Observed events" value={observed} />
      </div>

      <div className="principles-grid">
        <article>
          <span className="step">01</span>
          <h3>Freeze the question</h3>
          <p>Define what counts as occurrence, the exact window, and which sources are required before observation begins.</p>
        </article>
        <article>
          <span className="step">02</span>
          <h3>Inspect the universe</h3>
          <p>Validators independently fetch the same bounded public sources and classify coverage and occurrence.</p>
        </article>
        <article>
          <span className="step">03</span>
          <h3>Derive the receipt</h3>
          <p>The model never chooses the final state. Contract logic derives OBSERVED, NOT_OBSERVED, INCONCLUSIVE or EXTERNAL_FAILURE.</p>
        </article>
      </div>

      <section className="boundary-section">
        <div>
          <p className="eyebrow">Why precommitment matters</p>
          <h2>Two receipts. Different strength.</h2>
        </div>
        <div className="boundary-cards">
          <article className="boundary-card strong">
            <StatusPill value="PRECOMMITTED" />
            <h3>Strong absence receipt</h3>
            <p>The full source universe was sealed before the window opened. A finalized NOT_OBSERVED result can satisfy <code>can_rely_on_absence()</code>.</p>
          </article>
          <article className="boundary-card">
            <StatusPill value="RETROSPECTIVE" />
            <h3>Historical observation record</h3>
            <p>The case was sealed after the window began. It can record what sources show, but it can never masquerade as a precommitted negative proof.</p>
          </article>
        </div>
      </section>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function CreateCase({
  busy,
  walletReady,
  onConnect,
  onCreated,
}: {
  busy: string
  walletReady: boolean
  onConnect: () => void
  onCreated: (args: unknown[]) => Promise<void>
}) {
  const [form, setForm] = useState({
    title: '',
    event: '',
    rule: '',
    context: '',
    start: '',
    end: '',
  })

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!walletReady) return onConnect()
    const start = unixFromLocal(form.start)
    const end = unixFromLocal(form.end)
    if (!Number.isFinite(start) || !Number.isFinite(end)) return
    await onCreated([form.title, form.event, form.rule, form.context, start, end])
  }

  return (
    <section className="create-page">
      <div className="create-intro">
        <p className="eyebrow">New observation</p>
        <h1>Define the event before you define the evidence.</h1>
        <p>
          The source universe is added after the draft is created. Seal it before the
          observation window starts to earn PRECOMMITTED status.
        </p>
        <div className="rule-callout">
          <span>Key rule</span>
          <strong>A mandatory source must have a defensible coverage rule.</strong>
          <p>“This official log lists every disclosure during the window” is useful. “Check this website” is not.</p>
        </div>
      </div>

      <form className="create-form" onSubmit={submit}>
        <label>
          Case title
          <input
            required
            maxLength={120}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Q3 security disclosure observation"
          />
        </label>
        <label>
          Event definition
          <textarea
            required
            value={form.event}
            onChange={(e) => setForm({ ...form, event: e.target.value })}
            placeholder="Project Atlas publishes its Q3 security disclosure to the public."
          />
        </label>
        <label>
          What counts as occurrence?
          <textarea
            required
            value={form.rule}
            onChange={(e) => setForm({ ...form, rule: e.target.value })}
            placeholder="A qualifying occurrence must be the actual disclosure, not a teaser, roadmap promise or third-party rumor."
          />
        </label>
        <label>
          Context
          <textarea
            value={form.context}
            onChange={(e) => setForm({ ...form, context: e.target.value })}
            placeholder="Optional disambiguating context for validators."
          />
        </label>
        <div className="split-fields">
          <label>
            Window starts
            <input required type="datetime-local" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
          </label>
          <label>
            Window ends
            <input required type="datetime-local" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
          </label>
        </div>
        <button className="primary form-submit" disabled={Boolean(busy)}>
          {busy || (walletReady ? 'Create draft' : 'Connect wallet to create')}
        </button>
      </form>
    </section>
  )
}

function CaseDetail({
  item,
  sources,
  wallet,
  busy,
  onAddSource,
  onSeal,
  onResolve,
}: {
  item: ObservationCase
  sources: ObservationSource[]
  wallet: string
  busy: string
  onAddSource: (args: unknown[]) => Promise<void>
  onSeal: () => Promise<void>
  onResolve: () => Promise<void>
}) {
  const [showSourceForm, setShowSourceForm] = useState(false)
  const mine = addressMatch(item.creator, wallet)
  const now = Math.floor(Date.now() / 1000)
  const canResolve = (item.status_name === 'SEALED' || item.status_name === 'RETRYABLE')
    && now >= item.window_end
    && now >= item.retry_after

  return (
    <div className="case-detail">
      <div className="case-titlebar">
        <div>
          <p className="eyebrow">Case #{item.case_id}</p>
          <h2>{item.title}</h2>
        </div>
        <div className="title-pills">
          <StatusPill value={item.mode_name} />
          <StatusPill value={item.status_name} />
        </div>
      </div>

      <div className="receipt-banner">
        <OutcomeMark outcome={item.outcome_name} />
        <div>
          <span>Current result</span>
          <strong>{item.outcome_name.replaceAll('_', ' ')}</strong>
          <p>
            {item.strong_absence_receipt
              ? 'Precommitted source coverage is complete. This receipt satisfies the strong absence gate.'
              : item.outcome_name === 'NOT_OBSERVED'
                ? 'No qualifying occurrence was found, but this is retrospective and cannot satisfy the strong absence gate.'
                : item.outcome_name === 'OBSERVED'
                  ? 'At least one reviewed source contains a qualifying in-window occurrence.'
                  : item.outcome_name === 'INCONCLUSIVE'
                    ? 'Coverage or event identity was insufficient for a safe negative conclusion.'
                    : item.outcome_name === 'EXTERNAL_FAILURE'
                      ? 'A mandatory source could not be inspected. The case may be retried without changing its source universe.'
                      : 'The source universe has not produced a final observation yet.'}
          </p>
        </div>
      </div>

      <div className="detail-grid">
        <article className="detail-card wide">
          <span className="detail-label">Event</span>
          <p>{item.event_definition}</p>
        </article>
        <article className="detail-card wide">
          <span className="detail-label">Occurrence rule</span>
          <p>{item.occurrence_rule}</p>
        </article>
        <article className="detail-card">
          <span className="detail-label">Window</span>
          <strong>{formatDate(item.window_start)}</strong>
          <span>to {formatDate(item.window_end)}</span>
        </article>
        <article className="detail-card">
          <span className="detail-label">Creator</span>
          <strong className="mono">{item.creator.slice(0, 12)}…</strong>
          <span>{mine ? 'Connected creator' : 'Public case'}</span>
        </article>
        {item.context && (
          <article className="detail-card wide">
            <span className="detail-label">Context</span>
            <p>{item.context}</p>
          </article>
        )}
      </div>

      <section className="sources-section">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Frozen universe</p>
            <h3>Observation sources</h3>
          </div>
          {mine && item.status_name === 'DRAFT' && (
            <button className="secondary compact" onClick={() => setShowSourceForm((value) => !value)}>
              {showSourceForm ? 'Close' : '+ Add source'}
            </button>
          )}
        </div>

        {showSourceForm && item.status_name === 'DRAFT' && (
          <SourceForm
            busy={busy}
            onSubmit={async (args) => {
              await onAddSource(args)
              setShowSourceForm(false)
            }}
          />
        )}

        <div className="source-table">
          <div className="source-table-head">
            <span>Source</span>
            <span>Coverage</span>
            <span>Occurrence</span>
          </div>
          {sources.length === 0 && <div className="empty">No sources registered.</div>}
          {sources.map((source) => (
            <div className="source-row" key={source.source_id}>
              <div>
                <div className="source-name">
                  <strong>{source.label}</strong>
                  {source.mandatory && <span className="required-tag">required</span>}
                </div>
                <a href={source.url} target="_blank" rel="noreferrer">{source.source_class_name.replaceAll('_', ' ')} ↗</a>
                <p>{source.coverage_rule}</p>
              </div>
              <div>
                <StatusPill value={source.coverage_name} />
                <small>{source.fetch_name.replaceAll('_', ' ')}</small>
              </div>
              <div>
                <StatusPill value={source.occurrence_name} />
                <small>{source.reviewed_at ? formatDate(source.reviewed_at) : 'not reviewed'}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="hashes">
        <HashLine label="Definition hash" value={item.definition_hash} />
        <HashLine label="Resolution hash" value={item.resolution_hash} />
        <HashLine label="Receipt hash" value={item.receipt_hash} />
        {item.retry_after > 0 && <div className="hash-line"><span>Retry available</span><code>{formatDate(item.retry_after)}</code></div>}
        {item.resolved_at > 0 && <div className="hash-line"><span>Last finalized review</span><code>{formatDate(item.resolved_at)}</code></div>}
      </section>

              <div className="case-actions">
        {mine && item.status_name === 'DRAFT' && (
          <button className="primary" onClick={onSeal} disabled={Boolean(busy) || sources.length === 0}>
            {busy || 'Seal source universe'}
          </button>
        )}
        {canResolve && (
          <button className="primary" onClick={onResolve} disabled={Boolean(busy)}>
            {busy || (item.status_name === 'RETRYABLE' ? 'Retry observation' : 'Resolve observation')}
          </button>
        )}
        {(item.status_name === 'SEALED' || item.status_name === 'RETRYABLE') && !canResolve && (
          <span className="action-note">
            {Date.now() / 1000 < item.window_end
              ? `Resolution unlocks after ${formatDate(item.window_end)}.`
              : `Retry unlocks after ${formatDate(item.retry_after)}.`}
          </span>
        )}
      </div>
    </div>
  )
}

function SourceForm({
  busy,
  onSubmit,
}: {
  busy: string
  onSubmit: (args: unknown[]) => Promise<void>
}) {
  const [form, setForm] = useState({
    label: '',
    url: '',
    sourceClass: 1,
    coverage: '',
    mandatory: true,
  })

  async function submit(event: FormEvent) {
    event.preventDefault()
    await onSubmit([form.label, form.url, form.sourceClass, form.coverage, form.mandatory])
  }

  return (
    <form className="source-form" onSubmit={submit}>
      <label>
        Source label
        <input required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Official disclosures log" />
      </label>
      <label>
        HTTPS URL
        <input required type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://example.org/disclosures" />
      </label>
      <label>
        Source class
        <select value={form.sourceClass} onChange={(e) => setForm({ ...form, sourceClass: Number(e.target.value) })}>
          {SOURCE_CLASSES.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
      </label>
      <label className="wide-field">
        Coverage rule
        <textarea required value={form.coverage} onChange={(e) => setForm({ ...form, coverage: e.target.value })} placeholder="This official log lists every qualifying disclosure and publication date throughout the full requested window." />
      </label>
      <label className="check-field">
        <input
          type="checkbox"
          checked={form.mandatory}
          disabled={form.sourceClass === 5}
          onChange={(e) => setForm({ ...form, mandatory: e.target.checked })}
        />
        Required for negative coverage
      </label>
      <button className="primary compact" disabled={Boolean(busy)}>{busy || 'Register source'}</button>
    </form>
  )
}

function HashLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="hash-line">
      <span>{label}</span>
      <code title={value}>{shortHash(value)}</code>
    </div>
  )
}

export default App
