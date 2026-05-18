import {
  createEmailAttachment,
  createEmailMessage,
  createEmailThread,
  getEmailThread,
  listEmailThreads,
  listUnreadEmailThreads,
  updateEmailThreadStatusAndLinks,
} from '@dataconnect/generated'
import type {
  CreateEmailAttachmentVariables,
  CreateEmailMessageVariables,
  CreateEmailThreadVariables,
  GetEmailThreadVariables,
  UpdateEmailThreadStatusAndLinksVariables,
} from '@dataconnect/generated'
import { getSossonDataConnect } from '@/lib/dataconnect'

export async function loadEmailThreadsFromSql() {
  const dc = getSossonDataConnect()
  const response = await listEmailThreads(dc)
  return response.data.emailThreads
}

export async function loadUnreadEmailThreadsFromSql() {
  const dc = getSossonDataConnect()
  const response = await listUnreadEmailThreads(dc)
  return response.data.emailThreads
}

export async function loadEmailThreadFromSql(input: GetEmailThreadVariables) {
  const dc = getSossonDataConnect()
  const response = await getEmailThread(dc, input)
  return response.data.emailThread
}

export async function createEmailThreadInSql(input: CreateEmailThreadVariables) {
  const dc = getSossonDataConnect()
  const response = await createEmailThread(dc, input)
  return response.data.emailThread_insert.id
}

export async function updateEmailThreadStatusAndLinksInSql(input: UpdateEmailThreadStatusAndLinksVariables) {
  const dc = getSossonDataConnect()
  const response = await updateEmailThreadStatusAndLinks(dc, input)
  return response.data.emailThread_update?.id ?? null
}

export async function createEmailMessageInSql(input: CreateEmailMessageVariables) {
  const dc = getSossonDataConnect()
  const response = await createEmailMessage(dc, input)
  return response.data.emailMessage_insert.id
}

export async function createEmailAttachmentInSql(input: CreateEmailAttachmentVariables) {
  const dc = getSossonDataConnect()
  const response = await createEmailAttachment(dc, input)
  return response.data.emailAttachment_insert.id
}
