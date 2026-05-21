import { mkdir, writeFile } from 'node:fs/promises'
import net from 'node:net'
import path from 'node:path'
import { initializeApp, getApps } from 'firebase-admin/app'
import { getDataConnect } from 'firebase-admin/data-connect'
import {
  connectorConfig,
  completePlanningJobSheet,
  createPlanningAssignment,
  createPlanningEvent,
  createPlanningJobSheet,
  createSossonPayrollPeriod,
  createSossonTeam,
  createSossonTeamLeavePeriod,
  createSossonTeamMember,
  createSossonWorkTimeEntry,
  listPlanningJobSheetsByEvent,
  listPlanningEventsByPeriod,
  listSossonPayrollPeriods,
  listSossonTeams,
  listSossonWorkTimeEntries,
  updatePlanningJobSheetProgress,
  updateSossonTeam,
  updateSossonTeamMember,
} from '@dataconnect/admin-generated'

const EMULATOR_HOST = '127.0.0.1'
const EMULATOR_PORT = 9399
const repoRoot = process.cwd()
const outputArg = process.argv.find(arg => arg.startsWith('--output='))
const outputPath = outputArg?.slice('--output='.length) || 'tmp/checkpoint-002/team-rh-local.json'

process.env.DATA_CONNECT_EMULATOR_HOST ??= `${EMULATOR_HOST}:${EMULATOR_PORT}`

function isPortOpen(host, port) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host, port })
    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.once('error', () => resolve(false))
    socket.setTimeout(1000, () => {
      socket.destroy()
      resolve(false)
    })
  })
}

function impersonate(uid, email) {
  return {
    impersonate: {
      authClaims: {
        sub: uid,
        uid,
        email,
        email_verified: true,
      },
    },
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function sameInstant(actual, expected) {
  return new Date(actual).getTime() === new Date(expected).getTime()
}

async function expectFailure(label, action) {
  try {
    await action()
  } catch (error) {
    return {
      label,
      allowed: false,
      message: error instanceof Error ? error.message.split('\n')[0] : String(error),
    }
  }

  throw new Error(`${label}: mutation autorisee alors qu'elle devait etre refusee.`)
}

async function writeOutput(payload) {
  const resolved = path.resolve(repoRoot, outputPath)
  const relative = path.relative(repoRoot, resolved)

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('--output doit rester dans le repo.')
  }

  if (!relative.startsWith(`tmp${path.sep}`)) {
    throw new Error('--output doit pointer sous tmp/ pour eviter de committer des preuves locales par accident.')
  }

  await mkdir(path.dirname(resolved), { recursive: true })
  await writeFile(resolved, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.error(`Preuve RH equipe SQL locale ecrite dans ${relative}`)
}

if (!(await isPortOpen(EMULATOR_HOST, EMULATOR_PORT))) {
  console.error(
    `SQL Connect emulator is not reachable at ${EMULATOR_HOST}:${EMULATOR_PORT}.\n` +
      'Start it first with: npm run emulators:dataconnect',
  )
  process.exit(1)
}

if (getApps().length === 0) {
  initializeApp({ projectId: 'sosson-sandbox' })
}

const dc = getDataConnect(connectorConfig)
const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
const year = 2026
const workDate = '2026-03-12'
const planningStartAt = '2026-03-12T07:00:00.000Z'
const planningEndAt = '2026-03-12T15:30:00.000Z'
const planningPeriodStart = '2026-03-12T00:00:00.000Z'
const planningPeriodEnd = '2026-03-12T23:59:59.999Z'
const manager = {
  id: 'team-rh-manager-local',
  email: 'team.rh.manager@sosson.local',
  nom: 'RHEquipeManager',
  prenom: 'Local',
  role: 'gerant',
  avatar: 'RM',
}
const assistant = {
  id: 'team-rh-assistant-local',
  email: 'team.rh.assistant@sosson.local',
  nom: 'RHEquipeAssistant',
  prenom: 'Local',
  role: 'assistante',
  avatar: 'RA',
}
const worker = {
  id: `team-rh-worker-${stamp}`,
  email: `team.rh.worker.${stamp}@sosson.local`,
  nom: `RHOuvrier ${stamp}`,
  prenom: 'Local',
  role: 'chef_chantier',
  avatar: 'RW',
}
const managerOptions = impersonate(manager.id, manager.email)
const assistantOptions = impersonate(assistant.id, assistant.email)

await dc.upsert('User', manager)
await dc.upsert('User', assistant)
await dc.upsert('User', worker)

const assistantCreateTeamAttempt = await expectFailure('assistante ne peut pas creer une equipe RH', () =>
  createSossonTeam(
    dc,
    {
      code: `assistante-refusee-${stamp}`,
      name: 'Equipe refusee',
      type: 'chantier',
      statut: 'active',
      theme: 'charpente',
      leadName: assistant.prenom,
      description: 'Cette creation doit etre refusee par RBAC.',
      activeSites: 'Sandbox locale',
      ordre: 900,
    },
    assistantOptions,
  ),
)

const teamResponse = await createSossonTeam(
  dc,
  {
    code: `rh-local-${stamp}`,
    name: `Equipe RH locale ${stamp}`,
    type: 'chantier_bureau',
    statut: 'active',
    theme: 'charpente',
    leadName: `${manager.prenom} ${manager.nom}`,
    description: 'Equipe finale creee par verification locale.',
    activeSites: 'Atelier local, Chantier local',
    ordre: 42,
  },
  managerOptions,
)
const teamId = teamResponse.data.sossonTeam_insert.id

await updateSossonTeam(
  dc,
  {
    id: teamId,
    name: `Equipe RH locale validee ${stamp}`,
    type: 'chantier_bureau',
    statut: 'active',
    theme: 'couverture',
    leadName: `${manager.prenom} ${manager.nom}`,
    description: 'Equipe finale modifiee par verification locale.',
    activeSites: 'Chantier local, Bureau local',
    ordre: 41,
  },
  managerOptions,
)

const targetTeamResponse = await createSossonTeam(
  dc,
  {
    code: `rh-local-final-${stamp}`,
    name: `Equipe RH finale ${stamp}`,
    type: 'chantier',
    statut: 'active',
    theme: 'gros_oeuvre',
    leadName: `${manager.prenom} ${manager.nom}`,
    description: 'Equipe finale destination pour tester la transposition SQL.',
    activeSites: 'Chantier final local',
    ordre: 43,
  },
  managerOptions,
)
const targetTeamId = targetTeamResponse.data.sossonTeam_insert.id

const memberResponse = await createSossonTeamMember(
  dc,
  {
    teamId,
    userId: null,
    firstName: worker.prenom,
    lastName: worker.nom,
    title: 'Chef equipe local',
    qualification: 'Ossature bois N4P1',
    level: 'Responsable chantier local',
    salaryGrossMonthly: 3100,
    contract: 'CDI ouvrier qualifie',
    coefficient: 'BTP 250',
    email: worker.email,
    phone: '06 00 00 00 03',
    status: 'terrain',
    site: 'Chantier local',
    activeSites: 'Chantier local, Bureau local',
    responsibilities: 'Pilotage chantier, Point heures, Securite',
    permissions: 'chantiers, documents, planning',
  },
  managerOptions,
)
const memberId = memberResponse.data.sossonTeamMember_insert.id

await updateSossonTeamMember(
  dc,
  {
    id: memberId,
    teamId,
    userId: worker.id,
    title: 'Chef equipe local confirme',
    qualification: 'Ossature bois N4P2',
    level: 'Responsable chantier confirme',
    salaryGrossMonthly: 3250,
    contract: 'CDI ouvrier qualifie',
    coefficient: 'BTP 270',
    phone: '06 00 00 00 04',
    status: 'terrain',
    site: 'Bureau local',
    activeSites: 'Bureau local, Chantier local',
    responsibilities: 'Pilotage chantier, Validation heures, Coordination planning',
    permissions: 'chantiers, documents, planning, rapports',
  },
  managerOptions,
)

await updateSossonTeamMember(
  dc,
  {
    id: memberId,
    teamId: targetTeamId,
    userId: worker.id,
    title: 'Chef equipe local confirme',
    qualification: 'Ossature bois N4P2',
    level: 'Responsable chantier confirme',
    salaryGrossMonthly: 3250,
    contract: 'CDI ouvrier qualifie',
    coefficient: 'BTP 270',
    phone: '06 00 00 00 04',
    status: 'terrain',
    site: 'Chantier final local',
    activeSites: 'Chantier final local',
    responsibilities: 'Pilotage chantier final, Validation heures, Coordination planning',
    permissions: 'chantiers, documents, planning, rapports',
  },
  managerOptions,
)

const leaveResponse = await createSossonTeamLeavePeriod(
  dc,
  {
    memberId,
    type: 'conges',
    month: 'Mars',
    startDay: 18,
    endDay: 20,
    status: 'approved',
    note: 'Conge RH local valide.',
  },
  managerOptions,
)
const leaveId = leaveResponse.data.sossonTeamLeavePeriod_insert.id

const workTimeResponse = await createSossonWorkTimeEntry(
  dc,
  {
    memberId,
    chantierId: null,
    workDate,
    hours: 7.5,
    kind: 'chantier',
    status: 'submitted',
    notes: 'Ligne heures locale pour preparation paie.',
  },
  managerOptions,
)
const workTimeId = workTimeResponse.data.sossonWorkTimeEntry_insert.id

const payrollResponse = await createSossonPayrollPeriod(
  dc,
  {
    memberId,
    periodLabel: '2026-03',
    year,
    month: 3,
    baseSalaryGrossMonthly: 3250,
    overtimeHours: 2.5,
    paidLeaveDays: 3,
    absenceDays: 0,
    grossEstimate: 3317.0,
    status: 'draft',
    notes: 'Brouillon paie local non legal.',
  },
  managerOptions,
)
const payrollId = payrollResponse.data.sossonPayrollPeriod_insert.id

const eventResponse = await createPlanningEvent(
  dc,
  {
    chantierId: null,
    titre: `Planning equipe SQL ${stamp}`,
    eventType: targetTeamId,
    statut: 'planned',
    startAt: planningStartAt,
    endAt: planningEndAt,
    location: 'Chantier local',
    notes: 'Carte planning liee a une equipe finale SQL apres transposition.',
  },
  managerOptions,
)
const eventId = eventResponse.data.planningEvent_insert.id

const assignmentResponse = await createPlanningAssignment(
  dc,
  {
    eventId,
    userId: worker.id,
    sossonTeamId: targetTeamId,
    assignmentRole: targetTeamId,
    statut: 'planned',
    notes: 'Affectation vers equipe SQL finale.',
  },
  managerOptions,
)
const assignmentId = assignmentResponse.data.planningAssignment_insert.id

const jobSheetResponse = await createPlanningJobSheet(
  dc,
  {
    eventId,
    assignmentId,
    chantierId: null,
    sossonTeamId: targetTeamId,
    leadMemberId: memberId,
    titre: `Fiche intervention SQL ${stamp}`,
    statut: 'ready',
    instructions: 'Controle support, materiel et securite avant intervention.',
    plannedHours: 7.5,
    actualHours: null,
    checklist: 'Materiel, Securite, Photos fin chantier',
    materials: 'Camion atelier, consommables',
    blockers: null,
  },
  managerOptions,
)
const jobSheetId = jobSheetResponse.data.planningJobSheet_insert.id

await updatePlanningJobSheetProgress(
  dc,
  {
    id: jobSheetId,
    statut: 'in_progress',
    instructions: 'Controle support, materiel et securite avant intervention.',
    plannedHours: 7.5,
    actualHours: 7.25,
    checklist: 'Materiel OK, Securite OK, Photos a joindre',
    materials: 'Camion atelier, consommables',
    blockers: null,
    completionNotes: 'Execution locale en cours.',
    proofStoragePath: null,
    proofSha256: null,
    reportStoragePath: null,
    reportSha256: null,
  },
  managerOptions,
)

const jobSheetWorkTimeResponse = await createSossonWorkTimeEntry(
  dc,
  {
    memberId,
    chantierId: null,
    planningEventId: eventId,
    planningAssignmentId: assignmentId,
    jobSheetId,
    workDate,
    hours: 7.25,
    kind: 'chantier',
    status: 'submitted',
    notes: 'Ligne heures rattachee a la fiche intervention SQL.',
  },
  managerOptions,
)
const jobSheetWorkTimeId = jobSheetWorkTimeResponse.data.sossonWorkTimeEntry_insert.id

await completePlanningJobSheet(
  dc,
  {
    id: jobSheetId,
    actualHours: 7.25,
    completionNotes: 'Fiche intervention locale terminee avec heures rattachees.',
    proofStoragePath: null,
    proofSha256: null,
    reportStoragePath: null,
    reportSha256: null,
  },
  managerOptions,
)

const [teamsResponse, workTimesResponse, payrollResponseRead, planningResponse, jobSheetsResponse] = await Promise.all([
  listSossonTeams(dc, managerOptions),
  listSossonWorkTimeEntries(dc, { startDate: '2026-03-01', endDate: '2026-03-31' }, managerOptions),
  listSossonPayrollPeriods(dc, { year }, managerOptions),
  listPlanningEventsByPeriod(
    dc,
    {
      startAt: planningPeriodStart,
      endAt: planningPeriodEnd,
    },
    managerOptions,
  ),
  listPlanningJobSheetsByEvent(dc, { eventId }, managerOptions),
])

const teamReadBack = teamsResponse.data.sossonTeams.find(team => team.id === teamId)
const targetTeamReadBack = teamsResponse.data.sossonTeams.find(team => team.id === targetTeamId)
const memberReadBack = targetTeamReadBack?.members.find(member => member.id === memberId)
const leaveReadBack = memberReadBack?.leaves.find(leave => leave.id === leaveId)
const workTimeReadBack = workTimesResponse.data.sossonWorkTimeEntries.find(entry => entry.id === workTimeId)
const payrollReadBack = payrollResponseRead.data.sossonPayrollPeriods.find(period => period.id === payrollId)
const planningReadBack = planningResponse.data.planningEvents.find(event => event.id === eventId)
const assignmentReadBack = planningReadBack?.assignmentsByPeriod.find(assignment => assignment.id === assignmentId)
const jobSheetReadBack = planningReadBack?.jobSheetsByPeriod.find(jobSheet => jobSheet.id === jobSheetId)
  ?? jobSheetsResponse.data.planningJobSheets.find(jobSheet => jobSheet.id === jobSheetId)
const jobSheetWorkTimeReadBack = workTimesResponse.data.sossonWorkTimeEntries.find(entry => entry.id === jobSheetWorkTimeId)
const jobSheetWorkTimeNested = jobSheetReadBack?.workTimesByPeriodJobSheet?.find(entry => entry.id === jobSheetWorkTimeId)
  ?? jobSheetsResponse.data.planningJobSheets
    .find(jobSheet => jobSheet.id === jobSheetId)
    ?.workTimesByEventJobSheet.find(entry => entry.id === jobSheetWorkTimeId)

assert(teamReadBack, 'SossonTeam creee introuvable via ListSossonTeams.')
assert(teamReadBack.name === `Equipe RH locale validee ${stamp}`, 'UpdateSossonTeam non relu.')
assert(teamReadBack.theme === 'couverture', 'Theme equipe SQL non modifie.')
assert(targetTeamReadBack, 'Equipe finale destination introuvable via ListSossonTeams.')
assert(memberReadBack, 'SossonTeamMember deplace introuvable dans equipe finale destination.')
assert(memberReadBack.title === 'Chef equipe local confirme', 'UpdateSossonTeamMember non relu.')
assert(memberReadBack.user?.id === worker.id, 'SossonTeamMember non relie au User SQL.')
assert(leaveReadBack, 'SossonTeamLeavePeriod cree introuvable dans la fiche membre.')
assert(leaveReadBack.status === 'approved', 'Conge SQL relu avec statut inattendu.')
assert(workTimeReadBack, 'SossonWorkTimeEntry cree introuvable via ListSossonWorkTimeEntries.')
assert(workTimeReadBack.member.id === memberId, 'Ligne heures non rattachee au membre SQL.')
assert(workTimeReadBack.approvedBy?.id === manager.id, 'Ligne heures non rattachee au validateur SQL.')
assert(payrollReadBack, 'SossonPayrollPeriod cree introuvable via ListSossonPayrollPeriods.')
assert(payrollReadBack.member.id === memberId, 'Brouillon paie non rattache au membre SQL.')
assert(payrollReadBack.status === 'draft', 'Brouillon paie relu avec statut inattendu.')
assert(planningReadBack, 'PlanningEvent equipe SQL introuvable via ListPlanningEventsByPeriod.')
assert(sameInstant(planningReadBack.startAt, planningStartAt), 'Debut planning equipe SQL inattendu.')
assert(assignmentReadBack, 'PlanningAssignment equipe SQL introuvable.')
assert(assignmentReadBack.sossonTeam?.id === targetTeamId, 'PlanningAssignment ne relit pas sossonTeamId final.')
assert(jobSheetReadBack, 'PlanningJobSheet introuvable via le planning ou la query dediee.')
assert(jobSheetReadBack.statut === 'completed', 'PlanningJobSheet non relue comme terminee.')
assert(jobSheetReadBack.sossonTeam?.id === targetTeamId, 'PlanningJobSheet non rattachee a l equipe SQL finale.')
assert(jobSheetReadBack.leadMember?.id === memberId, 'PlanningJobSheet non rattachee au membre pilote.')
assert(jobSheetWorkTimeReadBack, 'Heures rattachees a la fiche intervention introuvables.')
assert(jobSheetWorkTimeNested, 'Heures non relues depuis la fiche intervention.')
assert(jobSheetWorkTimeReadBack.jobSheet?.id === jobSheetId, 'Ligne heures non rattachee a PlanningJobSheet.')

const checks = {
  emulatorReachable: true,
  assistantCannotCreateTeam: assistantCreateTeamAttempt.allowed === false,
  teamCreatedAndUpdated: Boolean(teamReadBack) && teamReadBack.name === `Equipe RH locale validee ${stamp}`,
  memberCreatedAndUpdated: Boolean(memberReadBack) && memberReadBack.title === 'Chef equipe local confirme',
  memberMovedToFinalTeam: Boolean(targetTeamReadBack) && Boolean(memberReadBack),
  memberLinkedToUser: memberReadBack?.user?.id === worker.id,
  leaveCreatedAndNestedUnderMember: Boolean(leaveReadBack) && leaveReadBack.status === 'approved',
  workTimeCreatedAndListed: Boolean(workTimeReadBack) && workTimeReadBack.member.id === memberId,
  payrollCreatedAndListed: Boolean(payrollReadBack) && payrollReadBack.member.id === memberId,
  planningAssignmentLinkedToSqlTeam: assignmentReadBack?.sossonTeam?.id === targetTeamId,
  jobSheetCreatedCompletedAndListed: Boolean(jobSheetReadBack) && jobSheetReadBack.statut === 'completed',
  jobSheetLinkedToTeamAndMember: jobSheetReadBack?.sossonTeam?.id === targetTeamId && jobSheetReadBack.leadMember?.id === memberId,
  workTimeLinkedToJobSheet: jobSheetWorkTimeReadBack?.jobSheet?.id === jobSheetId && Boolean(jobSheetWorkTimeNested),
}
const failures = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name)

const proof = {
  mode: 'local-emulator',
  sandboxTouched: false,
  productionTouched: false,
  mutatesData: true,
  cleanupStrategy: 'Donnees isolees par libelles horodates; aucune suppression distante ou reelle.',
  generatedAt: new Date().toISOString(),
  workflow: 'SossonTeam source -> SossonTeam finale -> SossonTeamMember deplace -> conges -> heures -> brouillon paie -> planning sossonTeamId final',
  actors: {
    manager: { id: manager.id, role: manager.role },
    assistant: { id: assistant.id, role: assistant.role },
    worker: { id: worker.id, role: worker.role },
  },
  rbac: {
    assistantCreateTeamAttempt,
  },
  sourceTeam: teamReadBack
    ? {
        id: teamReadBack.id,
        code: teamReadBack.code,
        name: teamReadBack.name,
        type: teamReadBack.type,
        theme: teamReadBack.theme,
        memberCount: teamReadBack.members.length,
      }
    : null,
  finalTeam: targetTeamReadBack
    ? {
        id: targetTeamReadBack.id,
        code: targetTeamReadBack.code,
        name: targetTeamReadBack.name,
        type: targetTeamReadBack.type,
        theme: targetTeamReadBack.theme,
        memberCount: targetTeamReadBack.members.length,
      }
    : null,
  member: memberReadBack
    ? {
        id: memberReadBack.id,
        userId: memberReadBack.user?.id ?? null,
        title: memberReadBack.title,
        qualification: memberReadBack.qualification,
        salaryGrossMonthly: memberReadBack.salaryGrossMonthly,
        permissions: memberReadBack.permissions,
      }
    : null,
  leave: leaveReadBack
    ? {
        id: leaveReadBack.id,
        type: leaveReadBack.type,
        month: leaveReadBack.month,
        startDay: leaveReadBack.startDay,
        endDay: leaveReadBack.endDay,
        status: leaveReadBack.status,
      }
    : null,
  workTime: workTimeReadBack
    ? {
        id: workTimeReadBack.id,
        memberId: workTimeReadBack.member.id,
        workDate: workTimeReadBack.workDate,
        hours: workTimeReadBack.hours,
        kind: workTimeReadBack.kind,
        status: workTimeReadBack.status,
        approvedById: workTimeReadBack.approvedBy?.id ?? null,
      }
    : null,
  payroll: payrollReadBack
    ? {
        id: payrollReadBack.id,
        memberId: payrollReadBack.member.id,
        periodLabel: payrollReadBack.periodLabel,
        year: payrollReadBack.year,
        month: payrollReadBack.month,
        grossEstimate: payrollReadBack.grossEstimate,
        status: payrollReadBack.status,
      }
    : null,
  planning: planningReadBack
    ? {
        eventId: planningReadBack.id,
        assignmentId,
        eventType: planningReadBack.eventType,
        assignmentTeamId: assignmentReadBack?.sossonTeam?.id ?? null,
        assignmentUserId: assignmentReadBack?.user?.id ?? null,
      }
    : null,
  checks,
}

await writeOutput(proof)
console.log(JSON.stringify(proof, null, 2))

if (failures.length > 0) {
  console.error(`Preuve RH equipe SQL locale KO:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
