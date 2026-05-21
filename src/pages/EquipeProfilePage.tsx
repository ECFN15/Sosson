import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Euro,
  HardHat,
  Mail,
  Phone,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import { appPages, canAccessPage } from '@/lib/accessControl'
import type { PagePermissionKey } from '@/lib/accessControl'
import { isDataConnectEnabled } from '@/lib/dataconnect'
import { useApp } from '@/lib/store'
import {
  createId,
  formatSalary,
  getInitials,
  LEAVES_STORAGE_KEY,
  leaveTypeLabels,
  loadLeaves,
  loadMembers,
  loadTeams,
  MEMBERS_STORAGE_KEY,
  planningMonths,
  saveCollection,
  TEAMS_STORAGE_KEY,
  themeOptions,
} from '@/lib/teamDirectory'
import type { LeavePeriod, LeaveType, MemberStatus, TeamMember } from '@/lib/teamDirectory'
import {
  createPayrollPeriodInSql,
  createTeamLeavePeriodInSql,
  createWorkTimeEntryInSql,
  isUuidLike,
  listToSqlValue,
  loadPayrollPeriodsFromSql,
  loadTeamDirectoryFromSql,
  loadWorkTimeEntriesFromSql,
  permissionsToSqlValue,
  updateTeamMemberInSql,
} from '@/features/team/teamSql'

type DirectorySource = 'local' | 'loading-sql' | 'sql' | 'sql-empty' | 'sql-error'
type WorkTimeRow = Awaited<ReturnType<typeof loadWorkTimeEntriesFromSql>>[number]
type PayrollRow = Awaited<ReturnType<typeof loadPayrollPeriodsFromSql>>[number]

const statusLabels: Record<MemberStatus, string> = {
  terrain: 'Terrain',
  atelier: 'Atelier',
  bureau: 'Bureau',
  absent: 'Absent',
}

const standardMonthlyHours = 151.67

const emptyMember: TeamMember = {
  id: '',
  teamId: '',
  firstName: '',
  lastName: '',
  title: '',
  qualification: '',
  level: '',
  salaryGrossMonthly: 0,
  contract: '',
  coefficient: '',
  email: '',
  phone: '',
  status: 'terrain',
  site: '',
  activeSites: [],
  responsibilities: [],
  permissions: [],
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function currentPayrollLabel() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function parsePayrollLabel(value: string) {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value.trim())
  if (!match) return null
  return { year: Number(match[1]), month: Number(match[2]) }
}

function yearRange(year: number) {
  return {
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
  }
}

function clampDay(value: number) {
  if (!Number.isFinite(value)) return 1
  return Math.min(31, Math.max(1, Math.round(value)))
}

function positiveNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

function estimateGross(baseSalaryGrossMonthly: number, overtimeHours: number, absenceDays: number) {
  const hourlyRate = baseSalaryGrossMonthly > 0 ? baseSalaryGrossMonthly / standardMonthlyHours : 0
  const dailyRate = baseSalaryGrossMonthly > 0 ? baseSalaryGrossMonthly / 21.67 : 0
  return Math.max(0, baseSalaryGrossMonthly + overtimeHours * hourlyRate * 1.25 - absenceDays * dailyRate)
}

function leaveDuration(leave: LeavePeriod) {
  return Math.max(0, clampDay(leave.endDay) - clampDay(leave.startDay) + 1)
}

function payrollMonthName(periodLabel: string) {
  const period = parsePayrollLabel(periodLabel)
  if (!period) return null
  return planningMonths[period.month - 1] ?? null
}

function workDateMatchesPeriod(workDate: string, periodLabel: string) {
  return workDate.startsWith(`${periodLabel.trim()}-`)
}

function formatDecimal(value: number, digits = 2) {
  const fixed = value.toFixed(digits)
  return fixed.replace(/\.?0+$/, '')
}

function splitList(value: string, fallback: string[]) {
  const items = value.split(',').map(item => item.trim()).filter(Boolean)
  return items.length ? items : fallback
}

function joinList(items: string[]) {
  return items.join(', ')
}

function normalizePermissions(value: string, fallback: PagePermissionKey[]) {
  const knownPages = new Set<PagePermissionKey>(appPages.map(page => page.key))
  const permissions = splitList(value, []).filter(item => knownPages.has(item as PagePermissionKey)) as PagePermissionKey[]
  return permissions.length ? permissions : fallback
}

function profileDraftFromMember(member: TeamMember) {
  return {
    title: member.title,
    qualification: member.qualification,
    level: member.level,
    salaryGrossMonthly: String(member.salaryGrossMonthly || ''),
    contract: member.contract,
    coefficient: member.coefficient,
    phone: member.phone,
    status: member.status,
    site: member.site,
    activeSites: joinList(member.activeSites),
    responsibilities: joinList(member.responsibilities),
    permissions: joinList(member.permissions),
  }
}

export function EquipeProfilePage() {
  const { memberId } = useParams()
  const { user, accessMatrix } = useApp()
  const [teams, setTeams] = useState(() => loadTeams())
  const [members, setMembers] = useState(() => loadMembers())
  const [leaves, setLeaves] = useState<LeavePeriod[]>(() => loadLeaves())
  const [directorySource, setDirectorySource] = useState<DirectorySource>('local')
  const [feedback, setFeedback] = useState('')
  const [draftMemberId, setDraftMemberId] = useState('')
  const [profileDraft, setProfileDraft] = useState(() => profileDraftFromMember(loadMembers()[0] ?? emptyMember))
  const [workTimes, setWorkTimes] = useState<WorkTimeRow[]>([])
  const [payrollPeriods, setPayrollPeriods] = useState<PayrollRow[]>([])
  const [timeDraft, setTimeDraft] = useState({
    workDate: todayKey(),
    hours: '7',
    kind: 'chantier',
    notes: '',
  })
  const [payrollDraft, setPayrollDraft] = useState({
    periodLabel: currentPayrollLabel(),
    overtimeHours: '0',
    paidLeaveDays: '0',
    absenceDays: '0',
    notes: '',
  })
  const [leaveDraft, setLeaveDraft] = useState({
    type: 'conges' as LeaveType,
    month: 'Aout',
    startDay: 1,
    endDay: 5,
    note: '',
  })

  const canEditEquipe = canAccessPage(user?.role, 'equipe', accessMatrix, 'edit')
  const canAdminEquipe = canAccessPage(user?.role, 'equipe', accessMatrix, 'admin')
  const canUseTeamSql = isDataConnectEnabled && Boolean(user)

  useEffect(() => {
    if (!canUseTeamSql) return

    let mounted = true

    async function loadDirectory() {
      setDirectorySource('loading-sql')
      try {
        const directory = await loadTeamDirectoryFromSql()
        if (!mounted) return
        if (directory.teams.length > 0) {
          setTeams(directory.teams)
          setMembers(directory.members)
          setLeaves(directory.leaves)
          setDirectorySource('sql')
        } else {
          setDirectorySource('sql-empty')
        }
      } catch (error) {
        if (!mounted) return
        setDirectorySource('sql-error')
        setFeedback(`Fiche SQL indisponible: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    void loadDirectory()

    return () => {
      mounted = false
    }
  }, [canUseTeamSql])

  useEffect(() => {
    if (directorySource === 'loading-sql' || directorySource === 'sql') return
    saveCollection(TEAMS_STORAGE_KEY, teams)
  }, [directorySource, teams])

  useEffect(() => {
    if (directorySource === 'loading-sql' || directorySource === 'sql') return
    saveCollection(MEMBERS_STORAGE_KEY, members)
  }, [directorySource, members])

  useEffect(() => {
    if (directorySource === 'loading-sql' || directorySource === 'sql') return
    saveCollection(LEAVES_STORAGE_KEY, leaves)
  }, [directorySource, leaves])

  const member = members.find(item => item.id === memberId)
  const team = teams.find(item => item.id === member?.teamId)
  const memberLeaves = useMemo(
    () => leaves.filter(leave => leave.memberId === member?.id),
    [leaves, member?.id],
  )
  const visiblePages = useMemo(
    () => appPages.filter(page => member?.permissions.includes(page.key)),
    [member?.permissions],
  )

  useEffect(() => {
    if (!member || draftMemberId === member.id) return
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      setProfileDraft(profileDraftFromMember(member))
      setDraftMemberId(member.id)
    })
    return () => {
      cancelled = true
    }
  }, [draftMemberId, member])

  const sqlMemberId = member?.id

  useEffect(() => {
    if (!canUseTeamSql || !sqlMemberId || !isUuidLike(sqlMemberId)) {
      queueMicrotask(() => {
        setWorkTimes([])
        setPayrollPeriods([])
      })
      return
    }

    let mounted = true
    const currentYear = new Date().getFullYear()
    const range = yearRange(currentYear)

    async function loadRhRows() {
      try {
        const [entries, periods] = await Promise.all([
          loadWorkTimeEntriesFromSql(range),
          loadPayrollPeriodsFromSql({ year: currentYear }),
        ])
        if (!mounted) return
        setWorkTimes(entries.filter(entry => entry.member.id === sqlMemberId))
        setPayrollPeriods(periods.filter(period => period.member.id === sqlMemberId))
      } catch (error) {
        if (!mounted) return
        setFeedback(`Heures/paie SQL indisponibles: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    void loadRhRows()

    return () => {
      mounted = false
    }
  }, [canUseTeamSql, sqlMemberId])

  if (directorySource === 'loading-sql' && (!member || !team)) {
    return (
      <div className="min-h-screen bg-[#FAF6F2] px-6 py-6 text-[#1E1E1E] lg:px-10">
        <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
          <p className="text-[15px] font-semibold">Lecture de la fiche SQL</p>
          <p className="mt-2 text-[13px] text-[#6B6B6B]">Chargement du repertoire equipe depuis Data Connect.</p>
        </section>
      </div>
    )
  }

  if (!member || !team) return <Navigate to="/equipe" replace />

  const activeMember = member
  const theme = themeOptions[team.theme]
  const isSqlMember = isUuidLike(activeMember.id)
  const sourceLabel = directorySource === 'sql'
    ? 'Fiche SQL'
    : directorySource === 'sql-error'
      ? 'Fallback local'
      : directorySource === 'sql-empty'
        ? 'SQL vide'
        : 'Fiche locale'
  const totalHours = workTimes.reduce((sum, entry) => sum + Number(entry.hours ?? 0), 0)
  const lastPayroll = payrollPeriods[0] ?? null
  const payrollSuggestion = (() => {
    const period = parsePayrollLabel(payrollDraft.periodLabel)
    const monthName = payrollMonthName(payrollDraft.periodLabel)
    if (!period || !monthName) return null

    const monthHours = workTimes
      .filter(entry => workDateMatchesPeriod(entry.workDate, payrollDraft.periodLabel))
      .reduce((sum, entry) => sum + Number(entry.hours ?? 0), 0)
    const monthLeaves = memberLeaves.filter(leave => leave.month === monthName)
    const paidLeaveDays = monthLeaves
      .filter(leave => leave.type === 'conges')
      .reduce((sum, leave) => sum + leaveDuration(leave), 0)
    const absenceDays = monthLeaves
      .filter(leave => leave.type === 'maladie')
      .reduce((sum, leave) => sum + leaveDuration(leave), 0)
    const overtimeHours = Math.max(0, monthHours - standardMonthlyHours)

    return {
      period,
      monthName,
      monthHours,
      overtimeHours,
      paidLeaveDays,
      absenceDays,
      grossEstimate: estimateGross(activeMember.salaryGrossMonthly, overtimeHours, absenceDays),
    }
  })()

  async function saveProfile() {
    if (!canEditEquipe) {
      setFeedback('Modification de fiche non autorisee pour ce profil.')
      return
    }

    const nextMember: TeamMember = {
      ...activeMember,
      title: profileDraft.title.trim() || activeMember.title,
      qualification: profileDraft.qualification.trim() || profileDraft.title.trim() || activeMember.qualification,
      level: profileDraft.level.trim() || activeMember.level,
      salaryGrossMonthly: Number(profileDraft.salaryGrossMonthly) || 0,
      contract: profileDraft.contract.trim() || 'A definir',
      coefficient: profileDraft.coefficient.trim() || 'A definir',
      phone: profileDraft.phone.trim(),
      status: profileDraft.status,
      site: profileDraft.site.trim() || 'A affecter',
      activeSites: splitList(profileDraft.activeSites, activeMember.activeSites.length ? activeMember.activeSites : ['A affecter']),
      responsibilities: splitList(profileDraft.responsibilities, ['Fiche de poste a completer']),
      permissions: normalizePermissions(profileDraft.permissions, activeMember.permissions),
    }

    if (canUseTeamSql && isSqlMember) {
      try {
        await updateTeamMemberInSql({
          id: activeMember.id,
          teamId: isUuidLike(activeMember.teamId) ? activeMember.teamId : null,
          title: nextMember.title,
          qualification: nextMember.qualification,
          level: nextMember.level,
          salaryGrossMonthly: nextMember.salaryGrossMonthly,
          contract: nextMember.contract,
          coefficient: nextMember.coefficient,
          phone: nextMember.phone || null,
          status: nextMember.status,
          site: nextMember.site,
          activeSites: listToSqlValue(nextMember.activeSites),
          responsibilities: listToSqlValue(nextMember.responsibilities),
          permissions: permissionsToSqlValue(nextMember.permissions),
        })
        setDirectorySource('sql')
      } catch (error) {
        setFeedback(`Fiche non sauvegardee en SQL: ${error instanceof Error ? error.message : String(error)}`)
        return
      }
    }

    setMembers(prev => prev.map(item => (item.id === activeMember.id ? nextMember : item)))
    setFeedback(canUseTeamSql && isSqlMember ? 'Fiche de poste mise a jour en SQL.' : 'Fiche de poste mise a jour localement.')
  }

  async function addLeave() {
    if (!canEditEquipe) {
      setFeedback('Modification des conges non autorisee pour ce profil.')
      return
    }

    const startDay = clampDay(leaveDraft.startDay)
    const endDay = Math.max(startDay, clampDay(leaveDraft.endDay))
    const leave: LeavePeriod = {
      id: createId('leave'),
      memberId: activeMember.id,
      type: leaveDraft.type,
      month: leaveDraft.month,
      startDay,
      endDay,
      note: leaveDraft.note.trim(),
    }

    if (canUseTeamSql && isSqlMember) {
      try {
        leave.id = await createTeamLeavePeriodInSql({
          memberId: activeMember.id,
          type: leave.type,
          month: leave.month,
          startDay: leave.startDay,
          endDay: leave.endDay,
          status: 'approved',
          note: leave.note || null,
        })
        setDirectorySource('sql')
      } catch (error) {
        setFeedback(`Conge non sauvegarde en SQL: ${error instanceof Error ? error.message : String(error)}`)
        return
      }
    }

    setLeaves(prev => [...prev, leave])
    setLeaveDraft(prev => ({ ...prev, note: '' }))
    setFeedback(canUseTeamSql && isSqlMember ? 'Conge ajoute en SQL.' : 'Conge ajoute localement.')
  }

  async function addWorkTime() {
    if (!canEditEquipe) {
      setFeedback('Saisie des heures non autorisee pour ce profil.')
      return
    }
    if (!canUseTeamSql || !isSqlMember) {
      setFeedback('La saisie des heures demande une fiche membre SQL.')
      return
    }

    const hours = positiveNumber(timeDraft.hours)
    if (hours <= 0) {
      setFeedback('Renseignez un nombre d heures superieur a zero.')
      return
    }

    try {
      await createWorkTimeEntryInSql({
        memberId: activeMember.id,
        chantierId: null,
        workDate: timeDraft.workDate,
        hours,
        kind: timeDraft.kind,
        status: 'submitted',
        notes: timeDraft.notes.trim() || null,
      })
      const currentYear = new Date().getFullYear()
      const entries = await loadWorkTimeEntriesFromSql(yearRange(currentYear))
      setWorkTimes(entries.filter(entry => entry.member.id === activeMember.id))
      setTimeDraft(prev => ({ ...prev, notes: '' }))
      setFeedback('Heures ajoutees en SQL.')
    } catch (error) {
      setFeedback(`Heures non sauvegardees en SQL: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  function applyPayrollSuggestion() {
    if (!payrollSuggestion) {
      setFeedback('Utilisez une periode au format AAAA-MM pour calculer le brouillon paie.')
      return
    }

    setPayrollDraft(prev => ({
      ...prev,
      overtimeHours: formatDecimal(payrollSuggestion.overtimeHours),
      paidLeaveDays: formatDecimal(payrollSuggestion.paidLeaveDays, 1),
      absenceDays: formatDecimal(payrollSuggestion.absenceDays, 1),
      notes: prev.notes.trim() || `Calcul SQL ${payrollSuggestion.monthName}: ${formatDecimal(payrollSuggestion.monthHours, 1)} h relues`,
    }))
    setFeedback('Brouillon paie alimente depuis les heures et absences SQL.')
  }

  async function addPayroll() {
    if (!canAdminEquipe) {
      setFeedback('Preparation paie reservee au gerant.')
      return
    }
    if (!canUseTeamSql || !isSqlMember) {
      setFeedback('La preparation paie demande une fiche membre SQL.')
      return
    }

    const period = parsePayrollLabel(payrollDraft.periodLabel)
    if (!period) {
      setFeedback('Utilisez un libelle de periode au format AAAA-MM.')
      return
    }

    const overtimeHours = positiveNumber(payrollDraft.overtimeHours)
    const paidLeaveDays = positiveNumber(payrollDraft.paidLeaveDays)
    const absenceDays = positiveNumber(payrollDraft.absenceDays)

    try {
      await createPayrollPeriodInSql({
        memberId: activeMember.id,
        periodLabel: payrollDraft.periodLabel.trim(),
        year: period.year,
        month: period.month,
        baseSalaryGrossMonthly: activeMember.salaryGrossMonthly || null,
        overtimeHours,
        paidLeaveDays,
        absenceDays,
        grossEstimate: estimateGross(activeMember.salaryGrossMonthly, overtimeHours, absenceDays),
        status: 'draft',
        notes: payrollDraft.notes.trim() || null,
      })
      const periods = await loadPayrollPeriodsFromSql({ year: period.year })
      setPayrollPeriods(periods.filter(item => item.member.id === activeMember.id))
      setPayrollDraft(prev => ({ ...prev, notes: '' }))
      setFeedback('Brouillon paie cree en SQL.')
    } catch (error) {
      setFeedback(`Preparation paie non sauvegardee en SQL: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  function deleteLeave(leaveId: string) {
    setLeaves(prev => prev.filter(leave => leave.id !== leaveId))
  }

  return (
    <div className="min-h-screen bg-[#FAF6F2] px-6 py-6 text-[#1E1E1E] lg:px-10">
      <div className="mx-auto max-w-[1180px] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/equipe" className="inline-flex h-10 items-center gap-2 rounded-[14px] border border-[#F2E8DC] bg-white px-4 text-[13px] font-semibold text-[#1E1E1E] transition hover:border-[#F06B21]">
            <ArrowLeft size={16} strokeWidth={1.75} />
            Retour equipe
          </Link>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-[14px] border border-[#F2E8DC] bg-white px-4 py-2 text-[12px] font-semibold text-[#1E1E1E]">{sourceLabel}</span>
            <span className="rounded-[14px] px-4 py-2 text-[12px] font-semibold" style={{ backgroundColor: theme.bg, color: theme.text }}>{team.name}</span>
          </div>
        </div>

        {feedback && (
          <div className="flex items-center justify-between rounded-[14px] border border-[#F2E8DC] bg-white px-4 py-3 text-[13px] font-medium text-[#3C3C3C]">
            <span>{feedback}</span>
            <button type="button" onClick={() => setFeedback('')} className="text-[#F06B21] hover:text-[#D95B17]">OK</button>
          </div>
        )}

        <section className="overflow-hidden rounded-[24px] border border-[#F2E8DC] bg-white">
          <div className="h-2" style={{ backgroundColor: theme.edge }} />
          <div className="grid gap-6 p-5 lg:grid-cols-[1.15fr_0.85fr] lg:p-7">
            <div className="flex min-w-0 gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[20px] text-[18px] font-bold" style={{ backgroundColor: theme.bg, color: theme.text }}>
                {getInitials(activeMember)}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold uppercase text-[#6B6B6B]">{theme.label}</p>
                <h1 className="mt-1 text-[30px] font-semibold leading-tight text-[#1E1E1E]">{activeMember.firstName} {activeMember.lastName}</h1>
                <p className="mt-2 text-[14px] text-[#6B6B6B]">{activeMember.title} - {team.name}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-[10px] bg-[#FAF6F2] px-3 py-1.5 text-[12px] font-semibold text-[#1E1E1E]">{activeMember.qualification}</span>
                  <span className="rounded-[10px] bg-[#FAF6F2] px-3 py-1.5 text-[12px] font-semibold text-[#1E1E1E]">{activeMember.level}</span>
                  <span className="rounded-[10px] px-3 py-1.5 text-[12px] font-semibold" style={{ backgroundColor: theme.bg, color: theme.text }}>{statusLabels[activeMember.status]}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoTile Icon={Mail} label="Email" value={activeMember.email || 'Email non renseigne'} />
              <InfoTile Icon={Phone} label="Telephone" value={activeMember.phone || 'Telephone non renseigne'} />
              <InfoTile Icon={HardHat} label="Affectation" value={activeMember.site} />
              <InfoTile Icon={Euro} label="Salaire brut" value={formatSalary(activeMember.salaryGrossMonthly)} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <SummaryTile Icon={CalendarDays} label="Conges" value={String(memberLeaves.length)} />
          <SummaryTile Icon={Clock3} label="Heures SQL" value={totalHours ? `${totalHours.toFixed(1)} h` : '0 h'} />
          <SummaryTile Icon={Euro} label="Paie" value={lastPayroll?.periodLabel ?? 'Aucun'} />
          <SummaryTile Icon={HardHat} label="Chantiers" value={String(activeMember.activeSites.length)} />
        </section>

        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <section className="space-y-5">
            <Panel title="Fiche de poste editable">
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={profileDraft.title} onChange={event => setProfileDraft(prev => ({ ...prev, title: event.target.value }))} placeholder="Poste" className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]" />
                <input value={profileDraft.qualification} onChange={event => setProfileDraft(prev => ({ ...prev, qualification: event.target.value }))} placeholder="Qualification" className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]" />
                <input value={profileDraft.level} onChange={event => setProfileDraft(prev => ({ ...prev, level: event.target.value }))} placeholder="Niveau" className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]" />
                <input value={profileDraft.salaryGrossMonthly} onChange={event => setProfileDraft(prev => ({ ...prev, salaryGrossMonthly: event.target.value }))} type="number" min="0" placeholder="Salaire brut mensuel" className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]" />
                <input value={profileDraft.contract} onChange={event => setProfileDraft(prev => ({ ...prev, contract: event.target.value }))} placeholder="Contrat" className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]" />
                <input value={profileDraft.coefficient} onChange={event => setProfileDraft(prev => ({ ...prev, coefficient: event.target.value }))} placeholder="Coefficient BTP" className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]" />
                <input value={profileDraft.phone} onChange={event => setProfileDraft(prev => ({ ...prev, phone: event.target.value }))} placeholder="Telephone" className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]" />
                <select value={profileDraft.status} onChange={event => setProfileDraft(prev => ({ ...prev, status: event.target.value as MemberStatus }))} className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]">
                  {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <input value={profileDraft.site} onChange={event => setProfileDraft(prev => ({ ...prev, site: event.target.value }))} placeholder="Affectation principale" className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]" />
                <input value={profileDraft.activeSites} onChange={event => setProfileDraft(prev => ({ ...prev, activeSites: event.target.value }))} placeholder="Chantiers suivis, separes par virgules" className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]" />
                <textarea value={profileDraft.responsibilities} onChange={event => setProfileDraft(prev => ({ ...prev, responsibilities: event.target.value }))} placeholder="Responsabilites, separees par virgules" rows={3} className="resize-none rounded-[14px] border border-[#F2E8DC] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#F06B21]" />
                <textarea value={profileDraft.permissions} onChange={event => setProfileDraft(prev => ({ ...prev, permissions: event.target.value }))} placeholder="Pages utiles, separees par virgules" rows={3} className="resize-none rounded-[14px] border border-[#F2E8DC] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#F06B21]" />
              </div>
              <button type="button" onClick={() => void saveProfile()} disabled={!canEditEquipe} className="mt-4 inline-flex h-10 items-center gap-2 rounded-[14px] bg-[#F06B21] px-4 text-[13px] font-semibold text-white transition hover:bg-[#D95B17] disabled:cursor-not-allowed disabled:bg-[#D99A72]">
                <Save size={16} strokeWidth={1.75} />
                Sauvegarder la fiche
              </button>
            </Panel>

            <Panel title="Responsabilites et chantiers">
              <div className="grid gap-4 lg:grid-cols-2">
                <TagGroup label="Responsabilites" items={activeMember.responsibilities} />
                <TagGroup label="Chantiers actifs" items={activeMember.activeSites} bordered />
              </div>
            </Panel>

            <Panel title="Heures SQL">
              {workTimes.length > 0 ? (
                <div className="space-y-2">
                  {workTimes.slice(0, 8).map(entry => (
                    <div key={entry.id} className="flex items-center justify-between gap-3 rounded-[12px] border border-[#F2E8DC] bg-[#FAF6F2] px-3 py-2 text-[12px]">
                      <span className="font-semibold text-[#1E1E1E]">{entry.workDate} - {entry.kind}</span>
                      <span className="text-[#6B6B6B]">{entry.hours} h</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-[14px] bg-[#FAF6F2] p-3 text-[12px] text-[#6B6B6B]">
                  Aucune heure SQL relue pour cette fiche sur l'exercice courant.
                </p>
              )}
            </Panel>

            <Panel title="Preparation paie">
              {payrollSuggestion && (
                <div className="mb-3 grid gap-2 sm:grid-cols-4">
                  <PayrollSignal label="Heures mois" value={`${formatDecimal(payrollSuggestion.monthHours, 1)} h`} />
                  <PayrollSignal label="Heures sup." value={`${formatDecimal(payrollSuggestion.overtimeHours, 1)} h`} />
                  <PayrollSignal label="Conges" value={`${formatDecimal(payrollSuggestion.paidLeaveDays, 1)} j`} />
                  <PayrollSignal label="Brut estime" value={formatSalary(payrollSuggestion.grossEstimate)} strong />
                </div>
              )}
              {payrollPeriods.length > 0 ? (
                <div className="space-y-2">
                  {payrollPeriods.slice(0, 8).map(period => (
                    <div key={period.id} className="rounded-[12px] border border-[#F2E8DC] bg-[#FAF6F2] px-3 py-2 text-[12px]">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-[#1E1E1E]">{period.periodLabel}</span>
                        <span className="font-semibold text-[#F06B21]">{period.grossEstimate ? formatSalary(period.grossEstimate) : 'A calculer'}</span>
                      </div>
                      <p className="mt-1 text-[#6B6B6B]">{period.overtimeHours ?? 0} h sup. - {period.paidLeaveDays ?? 0} j CP - {period.absenceDays ?? 0} j absence</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-[14px] bg-[#FAF6F2] p-3 text-[12px] text-[#6B6B6B]">
                  Aucun brouillon paie SQL relu pour cette fiche.
                </p>
              )}
            </Panel>

            <Panel title="Planning absences">
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {planningMonths.map(month => {
                  const monthLeaves = memberLeaves.filter(leave => leave.month === month)
                  return (
                    <div key={month} className="min-h-[88px] rounded-[14px] border border-[#F2E8DC] bg-[#FAF6F2] p-3">
                      <p className="text-[12px] font-semibold text-[#1E1E1E]">{month}</p>
                      <div className="mt-2 space-y-1.5">
                        {monthLeaves.length === 0 ? (
                          <p className="text-[11px] text-[#9CA3AF]">Disponible</p>
                        ) : monthLeaves.map(leave => (
                          <button key={leave.id} type="button" onClick={() => deleteLeave(leave.id)} className="flex w-full items-center justify-between gap-2 rounded-[8px] bg-white px-2 py-1.5 text-left text-[11px] font-semibold text-[#F06B21]">
                            <span className="truncate">{leaveTypeLabels[leave.type]} {leave.startDay}-{leave.endDay}</span>
                            <Trash2 size={12} strokeWidth={1.75} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Panel>
          </section>

          <aside className="space-y-5">
            <Panel title="Saisir des heures">
              <div className="grid gap-2">
                <input value={timeDraft.workDate} onChange={event => setTimeDraft(prev => ({ ...prev, workDate: event.target.value }))} type="date" className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]" />
                <input value={timeDraft.hours} onChange={event => setTimeDraft(prev => ({ ...prev, hours: event.target.value }))} type="number" min="0" step="0.25" className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]" />
                <select value={timeDraft.kind} onChange={event => setTimeDraft(prev => ({ ...prev, kind: event.target.value }))} className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]">
                  <option value="chantier">Chantier</option>
                  <option value="atelier">Atelier</option>
                  <option value="bureau">Bureau</option>
                  <option value="formation">Formation</option>
                </select>
                <input value={timeDraft.notes} onChange={event => setTimeDraft(prev => ({ ...prev, notes: event.target.value }))} placeholder="Note heures" className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]" />
                <button type="button" onClick={() => void addWorkTime()} disabled={!canEditEquipe} className="mt-1 inline-flex h-10 items-center justify-center gap-2 rounded-[14px] bg-[#1E1E1E] px-4 text-[13px] font-semibold text-white transition hover:bg-[#2A2A2A] disabled:cursor-not-allowed disabled:bg-[#9CA3AF]">
                  <Plus size={16} strokeWidth={1.75} />
                  Enregistrer
                </button>
              </div>
            </Panel>

            <Panel title="Brouillon paie">
              <div className="grid gap-2">
                <input value={payrollDraft.periodLabel} onChange={event => setPayrollDraft(prev => ({ ...prev, periodLabel: event.target.value }))} placeholder="AAAA-MM" className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]" />
                {payrollSuggestion && (
                  <div className="rounded-[14px] border border-[#F2E8DC] bg-[#FAF6F2] p-3">
                    <div className="grid grid-cols-2 gap-2 text-[12px]">
                      <PayrollSignal label="Heures" value={`${formatDecimal(payrollSuggestion.monthHours, 1)} h`} compact />
                      <PayrollSignal label="Absences" value={`${formatDecimal(payrollSuggestion.absenceDays, 1)} j`} compact />
                      <PayrollSignal label="CP" value={`${formatDecimal(payrollSuggestion.paidLeaveDays, 1)} j`} compact />
                      <PayrollSignal label="Brut" value={formatSalary(payrollSuggestion.grossEstimate)} compact strong />
                    </div>
                    <button type="button" onClick={applyPayrollSuggestion} disabled={!canAdminEquipe} className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-[12px] border border-[#F06B21] bg-white px-3 text-[12px] font-semibold text-[#F06B21] transition hover:bg-[#FFF4EC] disabled:cursor-not-allowed disabled:border-[#F2E8DC] disabled:text-[#9CA3AF]">
                      Calculer depuis SQL
                    </button>
                  </div>
                )}
                <input value={payrollDraft.overtimeHours} onChange={event => setPayrollDraft(prev => ({ ...prev, overtimeHours: event.target.value }))} type="number" min="0" step="0.25" placeholder="Heures sup." className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]" />
                <input value={payrollDraft.paidLeaveDays} onChange={event => setPayrollDraft(prev => ({ ...prev, paidLeaveDays: event.target.value }))} type="number" min="0" step="0.5" placeholder="CP jours" className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]" />
                <input value={payrollDraft.absenceDays} onChange={event => setPayrollDraft(prev => ({ ...prev, absenceDays: event.target.value }))} type="number" min="0" step="0.5" placeholder="Absence jours" className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]" />
                <input value={payrollDraft.notes} onChange={event => setPayrollDraft(prev => ({ ...prev, notes: event.target.value }))} placeholder="Note paie" className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]" />
                <button type="button" onClick={() => void addPayroll()} disabled={!canAdminEquipe} className="mt-1 inline-flex h-10 items-center justify-center gap-2 rounded-[14px] bg-[#1E1E1E] px-4 text-[13px] font-semibold text-white transition hover:bg-[#2A2A2A] disabled:cursor-not-allowed disabled:bg-[#9CA3AF]">
                  <Plus size={16} strokeWidth={1.75} />
                  Creer
                </button>
              </div>
            </Panel>

            <Panel title="Ajouter une absence">
              <div className="grid gap-2">
                <select value={leaveDraft.type} onChange={event => setLeaveDraft(prev => ({ ...prev, type: event.target.value as LeaveType }))} className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]">
                  {Object.entries(leaveTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <select value={leaveDraft.month} onChange={event => setLeaveDraft(prev => ({ ...prev, month: event.target.value }))} className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]">
                  {planningMonths.map(month => <option key={month} value={month}>{month}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input value={leaveDraft.startDay} onChange={event => setLeaveDraft(prev => ({ ...prev, startDay: Number(event.target.value) }))} type="number" min="1" max="31" className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]" />
                  <input value={leaveDraft.endDay} onChange={event => setLeaveDraft(prev => ({ ...prev, endDay: Number(event.target.value) }))} type="number" min="1" max="31" className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]" />
                </div>
                <input value={leaveDraft.note} onChange={event => setLeaveDraft(prev => ({ ...prev, note: event.target.value }))} placeholder="Note" className="h-10 rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] outline-none focus:border-[#F06B21]" />
                <button type="button" onClick={() => void addLeave()} disabled={!canEditEquipe} className="mt-1 inline-flex h-10 items-center justify-center gap-2 rounded-[14px] bg-[#1E1E1E] px-4 text-[13px] font-semibold text-white transition hover:bg-[#2A2A2A] disabled:cursor-not-allowed disabled:bg-[#9CA3AF]">
                  <Plus size={16} strokeWidth={1.75} />
                  Ajouter
                </button>
              </div>
            </Panel>

            <Panel title="Acces applicatifs">
              <div className="space-y-2">
                {visiblePages.length > 0 ? visiblePages.map(page => (
                  <div key={page.key} className="flex items-center justify-between rounded-[12px] border border-[#F2E8DC] bg-[#FAF6F2] px-3 py-2 text-[12px]">
                    <span className="font-semibold text-[#1E1E1E]">{page.label}</span>
                    <span className="rounded-[8px] bg-white px-2 py-1 text-[11px] font-semibold text-[#F06B21]">Ouvert</span>
                  </div>
                )) : (
                  <p className="rounded-[14px] bg-[#FAF6F2] p-3 text-[12px] text-[#6B6B6B]">Aucun acces declare.</p>
                )}
              </div>
            </Panel>
          </aside>
        </div>
      </div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
      <h2 className="text-[15px] font-semibold text-[#1E1E1E]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function PayrollSignal({ label, value, strong = false, compact = false }: { label: string; value: string; strong?: boolean; compact?: boolean }) {
  return (
    <div className={`${compact ? 'bg-white px-2 py-2' : 'bg-[#FAF6F2] px-3 py-2'} rounded-[12px] border border-[#F2E8DC]`}>
      <p className="text-[11px] font-semibold uppercase text-[#6B6B6B]">{label}</p>
      <p className={`mt-1 text-[13px] font-semibold ${strong ? 'text-[#F06B21]' : 'text-[#1E1E1E]'}`}>{value}</p>
    </div>
  )
}

function SummaryTile({ Icon, label, value }: { Icon: typeof HardHat; label: string; value: string }) {
  return (
    <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
      <Icon className="h-5 w-5 text-[#F06B21]" strokeWidth={1.75} />
      <p className="mt-4 text-[22px] font-semibold leading-none text-[#1E1E1E]">{value}</p>
      <p className="mt-2 text-[12px] font-medium text-[#6B6B6B]">{label}</p>
    </section>
  )
}

function TagGroup({ label, items, bordered = false }: { label: string; items: string[]; bordered?: boolean }) {
  return (
    <div>
      <p className="text-[12px] font-semibold uppercase text-[#6B6B6B]">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map(item => (
          <span key={item} className={`rounded-[10px] px-3 py-1.5 text-[12px] font-semibold text-[#1E1E1E] ${bordered ? 'border border-[#F2E8DC] bg-white' : 'bg-[#FAF6F2]'}`}>{item}</span>
        ))}
      </div>
    </div>
  )
}

function InfoTile({ Icon, label, value }: { Icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-[#F2E8DC] bg-[#FAF6F2] p-3">
      <div className="flex items-center gap-2 text-[#6B6B6B]">
        <Icon size={15} strokeWidth={1.75} />
        <span className="text-[11px] font-semibold uppercase">{label}</span>
      </div>
      <p className="mt-2 truncate text-[13px] font-semibold text-[#1E1E1E]">{value}</p>
    </div>
  )
}
