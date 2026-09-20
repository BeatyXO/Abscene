export type CaseStatus = 'DRAFT' | 'SEALED' | 'RETRYABLE' | 'FINAL'
export type CaseMode = 'UNSET' | 'PRECOMMITTED' | 'RETROSPECTIVE'
export type Outcome = 'UNRESOLVED' | 'OBSERVED' | 'NOT_OBSERVED' | 'INCONCLUSIVE' | 'EXTERNAL_FAILURE'

export type ObservationCase = {
  case_id: number
  creator: string
  title: string
  event_definition: string
  occurrence_rule: string
  context: string
  window_start: number
  window_end: number
  created_at: number
  sealed_at: number
  resolved_at: number
  status: number
  status_name: CaseStatus
  mode: number
  mode_name: CaseMode
  outcome: number
  outcome_name: Outcome
  source_ids: number[]
  mandatory_source_count: number
  definition_hash: string
  resolution_hash: string
  receipt_hash: string
  attempt_count: number
  retry_after: number
  strong_absence_receipt: boolean
}

export type ObservationSource = {
  source_id: number
  case_id: number
  label: string
  url: string
  source_class: number
  source_class_name: string
  coverage_rule: string
  mandatory: boolean
  source_hash: string
  fetch_code: number
  fetch_name: string
  coverage_code: number
  coverage_name: string
  occurrence_code: number
  occurrence_name: string
  reviewed_at: number
}
