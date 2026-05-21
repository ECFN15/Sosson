export type CoworkRealtimeSource = 'firestore' | 'local'

export type CoworkMessage = {
  id: string
  teamId: string
  authorId: string
  authorName: string
  authorRole: string
  text: string
  createdAt: string
  source: CoworkRealtimeSource
}

export type CoworkReportFile = {
  id: string
  name: string
  mimeType: string
  size: number
  localReference: string
  sha256: string | null
  previewUrl?: string
  localStatus: 'local_preview'
}

export type CoworkReportDraft = {
  id: string
  userId: string
  teamId: string
  chantierId: string
  noteText: string
  transcript: string
  files: CoworkReportFile[]
  updatedAt: string
  source: CoworkRealtimeSource
}

export type CoworkLeaveRequest = {
  id: string
  teamId: string
  memberId: string
  memberName: string
  type: string
  month: string
  startDay: number
  endDay: number
  note: string
  status: 'requested' | 'approved' | 'rejected'
  createdAt: string
  source: CoworkRealtimeSource
}
