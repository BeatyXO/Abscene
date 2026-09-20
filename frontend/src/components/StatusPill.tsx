import type { Outcome } from '../types'

export function StatusPill({ value }: { value: string }) {
  const key = value.toLowerCase().replaceAll('_', '-')
  return <span className={`pill pill-${key}`}>{value.replaceAll('_', ' ')}</span>
}

export function OutcomeMark({ outcome }: { outcome: Outcome }) {
  const icon = outcome === 'OBSERVED' ? '●'
    : outcome === 'NOT_OBSERVED' ? '○'
      : outcome === 'INCONCLUSIVE' ? '◇'
        : outcome === 'EXTERNAL_FAILURE' ? '!'
          : '·'
  return <span className={`outcome-mark outcome-${outcome.toLowerCase()}`} aria-hidden>{icon}</span>
}
