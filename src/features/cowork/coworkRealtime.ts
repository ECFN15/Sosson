import type {
  CoworkLeaveRequest,
  CoworkMessage,
  CoworkRealtimeSource,
  CoworkReportDraft,
} from '@/features/cowork/coworkTypes'

const LOCAL_EVENT = 'sosson:cowork-local-sync'
const MESSAGES_KEY = 'sosson.cowork.messages.v1'
const LEAVES_KEY = 'sosson.cowork.leaveRequests.v1'
const REPORT_DRAFTS_KEY = 'sosson.cowork.reportDrafts.v1'

function readCollection<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

function writeCollection<T>(key: string, value: T[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new Event(LOCAL_EVENT))
}

function makeId(prefix: string) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function subscribeLocal<T>(key: string, filter: (item: T) => boolean, onChange: (items: T[], source: CoworkRealtimeSource) => void) {
  function emit() {
    onChange(readCollection<T>(key).filter(filter), 'local')
  }

  emit()
  window.addEventListener(LOCAL_EVENT, emit)
  window.addEventListener('storage', emit)
  return () => {
    window.removeEventListener(LOCAL_EVENT, emit)
    window.removeEventListener('storage', emit)
  }
}

export function subscribeCoworkMessages(
  teamId: string,
  onChange: (messages: CoworkMessage[], source: CoworkRealtimeSource) => void,
) {
  const unsubscribeLocal = subscribeLocal<CoworkMessage>(
    MESSAGES_KEY,
    message => message.teamId === teamId,
    (messages, source) => onChange(messages.sort((a, b) => a.createdAt.localeCompare(b.createdAt)), source),
  )

  return unsubscribeLocal
}

export async function addCoworkMessage(message: Omit<CoworkMessage, 'id' | 'createdAt' | 'source'>) {
  const createdAt = new Date().toISOString()

  const nextMessage: CoworkMessage = {
    ...message,
    id: makeId('cowork-message'),
    createdAt,
    source: 'local',
  }
  writeCollection(MESSAGES_KEY, [...readCollection<CoworkMessage>(MESSAGES_KEY), nextMessage])
  return 'local' as CoworkRealtimeSource
}

export async function loadCoworkReportDraft(id: string) {
  return readCollection<CoworkReportDraft>(REPORT_DRAFTS_KEY).find(draft => draft.id === id) ?? null
}

export async function saveCoworkReportDraft(draft: CoworkReportDraft) {
  const nextDraft: CoworkReportDraft = {
    ...draft,
    updatedAt: new Date().toISOString(),
  }

  const drafts = readCollection<CoworkReportDraft>(REPORT_DRAFTS_KEY).filter(item => item.id !== nextDraft.id)
  writeCollection(REPORT_DRAFTS_KEY, [...drafts, { ...nextDraft, source: 'local' }])
  return 'local' as CoworkRealtimeSource
}

export function subscribeCoworkLeaveRequests(
  teamId: string,
  onChange: (requests: CoworkLeaveRequest[], source: CoworkRealtimeSource) => void,
) {
  const unsubscribeLocal = subscribeLocal<CoworkLeaveRequest>(
    LEAVES_KEY,
    request => request.teamId === teamId,
    (requests, source) => onChange(requests.sort((a, b) => b.createdAt.localeCompare(a.createdAt)), source),
  )

  return unsubscribeLocal
}

export async function addCoworkLeaveRequest(request: Omit<CoworkLeaveRequest, 'id' | 'createdAt' | 'source' | 'status'>) {
  const createdAt = new Date().toISOString()

  const nextRequest: CoworkLeaveRequest = {
    ...request,
    id: makeId('cowork-leave'),
    status: 'requested',
    createdAt,
    source: 'local',
  }
  writeCollection(LEAVES_KEY, [...readCollection<CoworkLeaveRequest>(LEAVES_KEY), nextRequest])
  return 'local' as CoworkRealtimeSource
}

export function getCoworkRealtimePreference() {
  return 'Fallback local actif: COWORK n a pas encore de modele SQL Connect dedie et Firestore front est bloque par la frontiere projet.'
}
