import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  Clock3,
  Euro,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Trash2,
  UserPlus,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { roleLabels } from '@/data/users'
import type { Role } from '@/data/users'
import { useApp } from '@/lib/store'
import { isDataConnectEnabled } from '@/lib/dataconnect'
import { waitForFirebaseUser } from '@/lib/firebaseAuthState'
import {
  accessCapabilities,
  appPages,
  canAccessPage,
  defaultAccessMatrix,
} from '@/lib/accessControl'
import type { AccessCapability, PagePermissionKey } from '@/lib/accessControl'
import {
  createId,
  formatSalary,
  getInitials,
  leaveTypeLabels,
  loadLeaves,
  loadMembers,
  loadTeams,
  MEMBERS_STORAGE_KEY,
  planningMonths,
  saveCollection,
  LEAVES_STORAGE_KEY,
  TEAMS_STORAGE_KEY,
  themeOptions,
} from '@/lib/teamDirectory'
import type { LeavePeriod, LeaveType, MemberStatus, Team, TeamMember, TeamTheme } from '@/lib/teamDirectory'
import { loadTeamProfilesFromSql } from '@/features/team/teamSql'
import {
  convertTeamProfileSubmissionInSql,
  createPayrollPeriodInSql,
  createTeamInSql,
  createTeamLeavePeriodInSql,
  createTeamMemberInSql,
  createWorkTimeEntryInSql,
  isUuidLike,
  listToSqlValue,
  loadTeamProfileSubmissionsFromSql,
  loadTeamDirectoryFromSql,
  makeTeamCode,
  permissionsToSqlValue,
  updateTeamMemberInSql,
} from '@/features/team/teamSql'
import type { ListedTeamProfileSubmission, SqlTeamProfile } from '@/features/team/teamSql'
import {
  buildInitials,
  labelRequestedTeamType,
} from '@/features/auth/teamProfileSubmission'

const roles: Role[] = ['gerant', 'assistante', 'chef_chantier', 'ouvrier']
type TeamDirectorySource = 'local' | 'sql' | 'sql-empty'
type ConversionDraft = {
  role: Role
  poste: string
}

const chantierValidationRoles: Role[] = ['ouvrier', 'chef_chantier']
const administratifValidationRoles: Role[] = ['assistante']
const gerantValidationRoles: Role[] = ['gerant']

const conversionPosteOptions: Record<Role, string[]> = {
  gerant: ['Gerant'],
  assistante: ['Assistant administratif'],
  chef_chantier: ["Chef d'equipe"],
  ouvrier: ['Ouvrier', 'Membre chantier'],
}

const capabilityLabels: Record<AccessCapability, string> = {
  view: 'Voir',
  create: 'Creer',
  edit: 'Modifier',
  admin: 'Admin',
}

const statusLabels: Record<MemberStatus, string> = {
  terrain: 'Terrain',
  atelier: 'Atelier',
  bureau: 'Bureau',
  absent: 'Absent',
}

function statusClass(status: MemberStatus) {
  if (status === 'terrain') return 'bg-[#FDEBDD] text-[#F06B21]'
  if (status === 'absent') return 'bg-[#FEE2E2] text-[#DC2626]'
  if (status === 'bureau') return 'bg-[#E6F4EA] text-[#1E8E3E]'
  return 'bg-[#FAF6F2] text-[#6B6B6B]'
}

function teamTypeFromTheme(theme: TeamTheme) {
  return theme === 'administratif' ? 'administratif' : 'chantier'
}

function defaultConversionRoleForRequestedTeamType(value: string | null | undefined): Role {
  if (value === 'administratif') return 'assistante'
  if (value === 'gerant') return 'gerant'
  return 'ouvrier'
}

function getConversionRoleOptions(value: string | null | undefined) {
  if (value === 'administratif') return administratifValidationRoles
  if (value === 'gerant') return gerantValidationRoles
  return chantierValidationRoles
}

function defaultPosteForRole(role: Role) {
  return conversionPosteOptions[role][0]
}

function getPosteOptionsForRole(role: Role) {
  return conversionPosteOptions[role]
}

function getDefaultConversionDraft(submission: ListedTeamProfileSubmission): ConversionDraft {
  const role = defaultConversionRoleForRequestedTeamType(submission.requestedTeamType)
  return {
    role,
    poste: defaultPosteForRole(role),
  }
}

function permissionsForConversionRole(role: Role): PagePermissionKey[] {
  if (role === 'gerant') return appPages.map(page => page.key)
  if (role === 'assistante') return ['clients', 'factures', 'documents', 'emails']
  return ['cowork']
}

function statusForConversionRole(role: Role): MemberStatus {
  return role === 'assistante' || role === 'gerant' ? 'bureau' : 'terrain'
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function currentPayrollLabel() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function parsePayrollLabel(label: string) {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(label.trim())
  if (!match) return null
  return { year: Number(match[1]), month: Number(match[2]) }
}

function asPositiveNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

function estimateGross(baseSalaryGrossMonthly: number, overtimeHours: number, absenceDays: number) {
  const hourlyRate = baseSalaryGrossMonthly > 0 ? baseSalaryGrossMonthly / 151.67 : 0
  const dailyRate = baseSalaryGrossMonthly > 0 ? baseSalaryGrossMonthly / 21.67 : 0
  return Math.max(0, baseSalaryGrossMonthly + overtimeHours * hourlyRate * 1.25 - absenceDays * dailyRate)
}

export function EquipePage() {
  const { user, accessMatrix, setAccessMatrix } = useApp()
  const [teams, setTeams] = useState<Team[]>(() => loadTeams())
  const [members, setMembers] = useState<TeamMember[]>(() => loadMembers())
  const [leaves, setLeaves] = useState<LeavePeriod[]>(() => loadLeaves())
  const [selectedTeamId, setSelectedTeamId] = useState(() => loadTeams()[0]?.id ?? '')
  const [selectedMemberId, setSelectedMemberId] = useState(() => loadMembers()[0]?.id ?? '')
  const [selectedRole, setSelectedRole] = useState<Role>('gerant')
  const [teamDraft, setTeamDraft] = useState({
    name: '',
    theme: 'charpente' as TeamTheme,
    lead: '',
    description: '',
    activeSites: '',
  })
  const [memberDraft, setMemberDraft] = useState({
    firstName: '',
    lastName: '',
    title: '',
    qualification: '',
    level: '',
    salaryGrossMonthly: '',
    contract: '',
    coefficient: '',
    email: '',
    phone: '',
    status: 'terrain' as MemberStatus,
    site: '',
    activeSites: '',
    responsibilities: '',
  })
  const [leaveDraft, setLeaveDraft] = useState({
    type: 'conges' as LeaveType,
    month: 'Juillet',
    startDay: 1,
    endDay: 5,
    note: '',
  })
  const [permissionFeedback, setPermissionFeedback] = useState('')
  const [sqlProfiles, setSqlProfiles] = useState<SqlTeamProfile[]>([])
  const [profileSubmissions, setProfileSubmissions] = useState<ListedTeamProfileSubmission[]>([])
  const [conversionDrafts, setConversionDrafts] = useState<Record<string, ConversionDraft>>({})
  const [sqlProfileStatus, setSqlProfileStatus] = useState<'idle' | 'loading' | 'sql' | 'unavailable'>('idle')
  const [sqlProfileMessage, setSqlProfileMessage] = useState('Lecture SQL User non lancee.')
  const [teamDirectorySource, setTeamDirectorySource] = useState<TeamDirectorySource>('local')
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
  const canCreateEquipe = canAccessPage(user?.role, 'equipe', accessMatrix, 'create')
  const canEditEquipe = canAccessPage(user?.role, 'equipe', accessMatrix, 'edit')
  const canAdminEquipe = canAccessPage(user?.role, 'equipe', accessMatrix, 'admin')

  function deny(message: string) {
    setPermissionFeedback(message)
  }

  function getConversionDraft(submission: ListedTeamProfileSubmission) {
    return conversionDrafts[submission.id] ?? getDefaultConversionDraft(submission)
  }

  function updateConversionDraft(submission: ListedTeamProfileSubmission, patch: Partial<ConversionDraft>) {
    setConversionDrafts(prev => {
      const current = prev[submission.id] ?? getDefaultConversionDraft(submission)
      return {
        ...prev,
        [submission.id]: {
          ...current,
          ...patch,
        },
      }
    })
  }

  useEffect(() => {
    if (teamDirectorySource !== 'local') return
    saveCollection(TEAMS_STORAGE_KEY, teams)
  }, [teamDirectorySource, teams])

  useEffect(() => {
    if (teamDirectorySource !== 'local') return
    saveCollection(MEMBERS_STORAGE_KEY, members)
  }, [members, teamDirectorySource])

  useEffect(() => {
    if (teamDirectorySource !== 'local') return
    saveCollection(LEAVES_STORAGE_KEY, leaves)
  }, [leaves, teamDirectorySource])

  useEffect(() => {
    let isMounted = true

    async function loadProfiles() {
      if (!isDataConnectEnabled || !user) {
        setSqlProfileStatus('unavailable')
        setSqlProfileMessage('Profils SQL non lus: Data Connect ou utilisateur absent. Les fiches equipe ci-dessous restent locales.')
        return
      }

      setSqlProfileStatus('loading')
      setSqlProfileMessage('Lecture des profils SQL User en cours.')

      try {
        const firebaseUser = await waitForFirebaseUser()
        if (!firebaseUser) {
          if (!isMounted) return
          setSqlProfileStatus('unavailable')
          setSqlProfileMessage('Profils SQL non lus: session Firebase absente.')
          return
        }

        const [profiles, submissions, directory] = await Promise.all([
          loadTeamProfilesFromSql(),
          user.role === 'gerant' ? loadTeamProfileSubmissionsFromSql() : Promise.resolve([]),
          loadTeamDirectoryFromSql(),
        ])
        if (!isMounted) return

        setSqlProfiles(profiles)
        setProfileSubmissions(submissions)
        if (directory.teams.length > 0) {
          setTeams(directory.teams)
          setMembers(directory.members)
          setLeaves(directory.leaves)
          setSelectedTeamId(directory.teams[0]?.id ?? '')
          setSelectedMemberId(directory.members[0]?.id ?? '')
          setTeamDirectorySource('sql')
        } else {
          setTeams([])
          setMembers([])
          setLeaves([])
          setSelectedTeamId('')
          setSelectedMemberId('')
          setTeamDirectorySource('sql-empty')
        }
        setSqlProfileStatus('sql')
        setSqlProfileMessage(
          profiles.length > 0 || submissions.length > 0 || directory.teams.length > 0
            ? `${profiles.length} profil(s), ${submissions.length} demande(s) onboarding et ${directory.teams.length} equipe(s) finale(s) lus depuis SQL.`
            : 'SQL repond mais aucun profil applicatif, demande onboarding ou equipe finale.',
        )
      } catch (error) {
        if (!isMounted) return
        setSqlProfiles([])
        setProfileSubmissions([])
        setTeamDirectorySource('local')
        setSqlProfileStatus('unavailable')
        setSqlProfileMessage(`Profils SQL indisponibles: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    void loadProfiles()

    return () => {
      isMounted = false
    }
  }, [user])

  const selectedTeam = teams.find(team => team.id === selectedTeamId) ?? teams[0] ?? null
  const selectedTeamMembers = useMemo(
    () => members.filter(member => member.teamId === selectedTeam?.id),
    [members, selectedTeam?.id]
  )
  const selectedMember = selectedTeamMembers.find(member => member.id === selectedMemberId) ?? selectedTeamMembers[0] ?? null
  const selectedMemberLeaves = useMemo(
    () => leaves.filter(leave => leave.memberId === selectedMember?.id),
    [leaves, selectedMember?.id]
  )

  const stats = useMemo(() => {
    const activeMembers = members.filter(member => member.status !== 'absent').length
    const controlledPages = appPages.filter(page => roles.some(role => accessMatrix[role][page.key].view)).length
    const leaveCount = leaves.length

    return [
      { label: 'Equipes chantier', value: String(teams.filter(team => team.theme !== 'administratif').length), Icon: UsersRound },
      { label: 'Membres actifs', value: String(activeMembers), Icon: UserRound },
      { label: 'Profils a classer', value: String(profileSubmissions.filter(submission => submission.status === 'pending').length), Icon: UserPlus },
      { label: 'Conges poses', value: String(leaveCount), Icon: CalendarDays },
      { label: 'Source equipes', value: teamDirectorySource === 'sql' ? 'SQL' : teamDirectorySource === 'sql-empty' ? 'Vide' : 'Local', Icon: ShieldCheck },
      { label: 'Profils SQL User', value: sqlProfileStatus === 'sql' ? String(sqlProfiles.length) : 'N/A', Icon: ShieldCheck },
      { label: 'Pages controlees', value: String(controlledPages), Icon: ShieldCheck },
    ]
  }, [accessMatrix, leaves.length, members, profileSubmissions, sqlProfileStatus, sqlProfiles.length, teamDirectorySource, teams])

  const roleStats = useMemo(() => {
    const pages = appPages.length
    const visible = appPages.filter(page => accessMatrix[selectedRole][page.key].view).length
    const editable = appPages.filter(page => accessMatrix[selectedRole][page.key].edit).length
    return { pages, visible, editable }
  }, [accessMatrix, selectedRole])

  function selectTeam(teamId: string) {
    setSelectedTeamId(teamId)
    setSelectedMemberId(members.find(member => member.teamId === teamId)?.id ?? '')
  }

  async function addTeam() {
    if (!canCreateEquipe) {
      deny('Creation equipe non autorisee pour ce profil.')
      return
    }

    if (sqlProfileStatus === 'loading') {
      deny('Attendez la fin de lecture SQL avant de creer une equipe.')
      return
    }

    const name = teamDraft.name.trim()
    if (!name) return

    const team: Team = {
      id: createId('team'),
      name,
      theme: teamDraft.theme,
      lead: teamDraft.lead.trim() || 'A definir',
      description: teamDraft.description.trim() || 'Equipe operationnelle chantier.',
      activeSites: splitList(teamDraft.activeSites, ['A affecter']),
    }

    if (isDataConnectEnabled && user && teamDirectorySource !== 'local') {
      try {
        team.id = await createTeamInSql({
          code: makeTeamCode(name),
          name: team.name,
          type: teamTypeFromTheme(team.theme),
          statut: 'active',
          theme: team.theme,
          leadName: team.lead,
          description: team.description,
          activeSites: listToSqlValue(team.activeSites),
          ordre: teams.length + 1,
        })
        setTeamDirectorySource('sql')
      } catch (error) {
        deny(`Equipe non creee: SQL indisponible (${error instanceof Error ? error.message : String(error)}). Aucun fallback local n'a ete cree.`)
        return
      }
    } else if (!isDataConnectEnabled || !user || teamDirectorySource === 'local') {
      deny('Equipe creee en fallback local: ce n est pas une preuve SQL.')
    }

    setTeams(prev => [...prev, team])
    setSelectedTeamId(team.id)
    setSelectedMemberId('')
    setTeamDraft({ name: '', theme: 'charpente', lead: '', description: '', activeSites: '' })
  }

  function deleteTeam(teamId: string) {
    if (!canEditEquipe) {
      deny('Suppression equipe non autorisee pour ce profil.')
      return
    }

    const deletedMemberIds = members.filter(member => member.teamId === teamId).map(member => member.id)
    const remainingTeams = teams.filter(team => team.id !== teamId)
    const nextTeam = selectedTeamId === teamId ? remainingTeams[0] : remainingTeams.find(team => team.id === selectedTeamId)
    const remainingMembers = members.filter(member => member.teamId !== teamId)

    setTeams(remainingTeams)
    setMembers(remainingMembers)
    setLeaves(prev => prev.filter(leave => !deletedMemberIds.includes(leave.memberId)))
    setSelectedTeamId(nextTeam?.id ?? '')
    setSelectedMemberId(remainingMembers.find(member => member.teamId === nextTeam?.id)?.id ?? '')
  }

  async function addMember() {
    if (!canCreateEquipe) {
      deny('Creation membre non autorisee pour ce profil.')
      return
    }

    if (!selectedTeam) return
    const firstName = memberDraft.firstName.trim()
    const lastName = memberDraft.lastName.trim()
    const title = memberDraft.title.trim()
    if (!firstName || !lastName || !title) return

    const member: TeamMember = {
      id: createId('member'),
      teamId: selectedTeam.id,
      firstName,
      lastName,
      title,
      qualification: memberDraft.qualification.trim() || memberDraft.level.trim() || title,
      level: memberDraft.level.trim() || 'Membre equipe',
      salaryGrossMonthly: Number(memberDraft.salaryGrossMonthly) || 0,
      contract: memberDraft.contract.trim() || 'A definir',
      coefficient: memberDraft.coefficient.trim() || 'A definir',
      email: memberDraft.email.trim(),
      phone: memberDraft.phone.trim(),
      status: memberDraft.status,
      site: memberDraft.site.trim() || selectedTeam.activeSites[0] || 'A affecter',
      activeSites: splitList(memberDraft.activeSites, selectedTeam.activeSites),
      responsibilities: splitList(memberDraft.responsibilities, ['Intervention chantier']),
      permissions: ['chantiers', 'documents'],
    }

    if (isDataConnectEnabled && user && teamDirectorySource !== 'local') {
      if (!isUuidLike(selectedTeam.id)) {
        deny("Fiche membre non creee: l'equipe selectionnee n'est pas une equipe SQL.")
        return
      }

      try {
        member.id = await createTeamMemberInSql({
          teamId: selectedTeam.id,
          userId: null,
          firstName: member.firstName,
          lastName: member.lastName,
          title: member.title,
          qualification: member.qualification,
          level: member.level,
          salaryGrossMonthly: member.salaryGrossMonthly,
          contract: member.contract,
          coefficient: member.coefficient,
          email: member.email || null,
          phone: member.phone || null,
          status: member.status,
          site: member.site,
          activeSites: listToSqlValue(member.activeSites),
          responsibilities: listToSqlValue(member.responsibilities),
          permissions: permissionsToSqlValue(member.permissions),
        })
        setTeamDirectorySource('sql')
      } catch (error) {
        deny(`Fiche membre non creee: SQL indisponible (${error instanceof Error ? error.message : String(error)}). Aucun fallback local n'a ete cree.`)
        return
      }
    } else if (!isDataConnectEnabled || !user || teamDirectorySource === 'local') {
      deny('Fiche membre creee en fallback local: ce n est pas une preuve SQL.')
    }

    setMembers(prev => [...prev, member])
    setSelectedMemberId(member.id)
    setMemberDraft({
      firstName: '',
      lastName: '',
      title: '',
      qualification: '',
      level: '',
      salaryGrossMonthly: '',
      contract: '',
      coefficient: '',
      email: '',
      phone: '',
      status: 'terrain',
      site: '',
      activeSites: '',
      responsibilities: '',
    })
  }

  function deleteMember(memberId: string) {
    if (!canEditEquipe) {
      deny('Suppression membre non autorisee pour ce profil.')
      return
    }

    const remaining = members.filter(member => member.id !== memberId)
    setMembers(remaining)
    setLeaves(prev => prev.filter(leave => leave.memberId !== memberId))
    setSelectedMemberId(remaining.find(member => member.teamId === selectedTeam?.id)?.id ?? '')
  }

  async function moveMemberToTeam(memberId: string, teamId: string) {
    if (!canEditEquipe) {
      deny('Modification membre non autorisee pour ce profil.')
      return
    }

    const movedMember = members.find(member => member.id === memberId)
    const targetTeam = teams.find(team => team.id === teamId)
    if (!movedMember || !targetTeam) return

    if (isDataConnectEnabled && user && isUuidLike(movedMember.id)) {
      if (!canAdminEquipe) {
        deny('Deplacement SQL reserve au gerant.')
        return
      }
      if (!isUuidLike(teamId)) {
        deny("Deplacement SQL refuse: l'equipe cible n'est pas une equipe finale SQL.")
        return
      }

      try {
        await updateTeamMemberInSql({
          id: movedMember.id,
          teamId,
          title: movedMember.title,
          qualification: movedMember.qualification,
          level: movedMember.level,
          salaryGrossMonthly: movedMember.salaryGrossMonthly,
          contract: movedMember.contract,
          coefficient: movedMember.coefficient,
          phone: movedMember.phone || null,
          status: movedMember.status,
          site: movedMember.site,
          activeSites: listToSqlValue(movedMember.activeSites),
          responsibilities: listToSqlValue(movedMember.responsibilities),
          permissions: permissionsToSqlValue(movedMember.permissions),
        })
        setTeamDirectorySource('sql')
      } catch (error) {
        deny(`Deplacement SQL impossible: ${error instanceof Error ? error.message : String(error)}`)
        return
      }
    } else if (!isDataConnectEnabled || !user || !isUuidLike(movedMember.id)) {
      deny('Deplacement en fallback local: ce n est pas une preuve SQL.')
    }

    setMembers(prev => prev.map(member => (member.id === memberId ? { ...member, teamId } : member)))
    setSelectedTeamId(teamId)
    setSelectedMemberId(memberId)
    deny(`${movedMember.firstName} ${movedMember.lastName} est rattache a ${targetTeam.name}.`)
  }

  async function addLeave() {
    if (!canEditEquipe) {
      deny('Modification conges non autorisee pour ce profil.')
      return
    }

    if (!selectedMember) return
    const startDay = clampDay(leaveDraft.startDay)
    const endDay = Math.max(startDay, clampDay(leaveDraft.endDay))

    const leave: LeavePeriod = {
      id: createId('leave'),
      memberId: selectedMember.id,
      type: leaveDraft.type,
      month: leaveDraft.month,
      startDay,
      endDay,
      note: leaveDraft.note.trim(),
    }

    if (isDataConnectEnabled && user && isUuidLike(selectedMember.id)) {
      try {
        leave.id = await createTeamLeavePeriodInSql({
          memberId: selectedMember.id,
          type: leave.type,
          month: leave.month,
          startDay: leave.startDay,
          endDay: leave.endDay,
          status: 'approved',
          note: leave.note || null,
        })
        setTeamDirectorySource('sql')
      } catch (error) {
        deny(`Conge non cree: SQL indisponible (${error instanceof Error ? error.message : String(error)}). Aucun fallback local n'a ete cree.`)
        return
      }
    } else if (!isDataConnectEnabled || !user || !isUuidLike(selectedMember.id)) {
      deny('Conge cree en fallback local: ce n est pas une preuve SQL.')
    }

    setLeaves(prev => [...prev, leave])
    setLeaveDraft(prev => ({ ...prev, note: '' }))
  }

  async function addWorkTimeEntry() {
    if (!canEditEquipe) {
      deny('Saisie des heures non autorisee pour ce profil.')
      return
    }

    if (!selectedMember) {
      deny('Selectionnez un membre avant de saisir des heures.')
      return
    }

    if (!isDataConnectEnabled || !user || !isUuidLike(selectedMember.id)) {
      deny('La saisie des heures demande une fiche membre SQL issue de la base.')
      return
    }

    const hours = asPositiveNumber(timeDraft.hours)
    if (hours <= 0) {
      deny('Renseignez un nombre d heures superieur a zero.')
      return
    }

    try {
      await createWorkTimeEntryInSql({
        memberId: selectedMember.id,
        chantierId: null,
        workDate: timeDraft.workDate,
        hours,
        kind: timeDraft.kind,
        status: 'submitted',
        notes: timeDraft.notes.trim() || null,
      })
      setTimeDraft(prev => ({ ...prev, notes: '' }))
      deny(`Heures envoyees en SQL pour ${selectedMember.firstName} ${selectedMember.lastName}.`)
    } catch (error) {
      deny(`Saisie des heures impossible: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async function addPayrollPeriod() {
    if (!canAdminEquipe) {
      deny('Preparation paie reservee au gerant.')
      return
    }

    if (!selectedMember) {
      deny('Selectionnez un membre avant de preparer une periode de paie.')
      return
    }

    if (!isDataConnectEnabled || !user || !isUuidLike(selectedMember.id)) {
      deny('La preparation paie demande une fiche membre SQL issue de la base.')
      return
    }

    const period = parsePayrollLabel(payrollDraft.periodLabel)
    if (!period) {
      deny('Utilisez un libelle de periode au format AAAA-MM.')
      return
    }

    const overtimeHours = asPositiveNumber(payrollDraft.overtimeHours)
    const paidLeaveDays = asPositiveNumber(payrollDraft.paidLeaveDays)
    const absenceDays = asPositiveNumber(payrollDraft.absenceDays)

    try {
      await createPayrollPeriodInSql({
        memberId: selectedMember.id,
        periodLabel: payrollDraft.periodLabel.trim(),
        year: period.year,
        month: period.month,
        baseSalaryGrossMonthly: selectedMember.salaryGrossMonthly || null,
        overtimeHours,
        paidLeaveDays,
        absenceDays,
        grossEstimate: estimateGross(selectedMember.salaryGrossMonthly, overtimeHours, absenceDays),
        status: 'draft',
        notes: payrollDraft.notes.trim() || null,
      })
      setPayrollDraft(prev => ({ ...prev, notes: '' }))
      deny(`Preparation paie ${payrollDraft.periodLabel} creee en SQL.`)
    } catch (error) {
      deny(`Preparation paie impossible: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  function deleteLeave(leaveId: string) {
    if (!canEditEquipe) {
      deny('Suppression conges non autorisee pour ce profil.')
      return
    }

    setLeaves(prev => prev.filter(leave => leave.id !== leaveId))
  }

  function toggleCapability(role: Role, pageKey: PagePermissionKey, capability: AccessCapability) {
    if (!canAdminEquipe) {
      deny('Modification des droits non autorisee pour ce profil.')
      return
    }

    const nextState = !accessMatrix[role][pageKey][capability]
    const nextCapabilities = { ...accessMatrix[role][pageKey], [capability]: nextState }

    if (capability === 'view' && !nextState) {
      accessCapabilities.forEach(item => {
        nextCapabilities[item] = false
      })
    }

    if (capability !== 'view' && nextState) {
      nextCapabilities.view = true
    }

    setAccessMatrix({
      ...accessMatrix,
      [role]: {
        ...accessMatrix[role],
        [pageKey]: nextCapabilities,
      },
    })
  }

  async function convertSubmissionToSelectedTeam(submission: ListedTeamProfileSubmission) {
    if (!canAdminEquipe) {
      deny('Conversion de profil reservee au gerant.')
      return
    }

    if (!selectedTeam) {
      deny('Selectionnez une equipe finale avant de convertir le profil.')
      return
    }

    if (!isUuidLike(selectedTeam.id)) {
      deny('Conversion refusee: selectionnez une equipe finale SQL avant de creer le User applicatif.')
      return
    }

    const existingMember = members.find(member => member.email.toLowerCase() === submission.email.toLowerCase())
    if (existingMember) {
      setSelectedTeamId(existingMember.teamId)
      setSelectedMemberId(existingMember.id)
      deny('Ce profil est deja transpose dans les fiches equipe locales.')
      return
    }

    const draft = getConversionDraft(submission)
    const allowedRoles = getConversionRoleOptions(submission.requestedTeamType)
    const role = allowedRoles.includes(draft.role)
      ? draft.role
      : defaultConversionRoleForRequestedTeamType(submission.requestedTeamType)
    const title = (role === draft.role ? draft.poste.trim() : '') || defaultPosteForRole(role)
    const memberId = createId('member')
    let convertedMemberId = memberId
    const member: TeamMember = {
      id: memberId,
      teamId: selectedTeam.id,
      firstName: submission.prenom,
      lastName: submission.nom,
      title,
      qualification: title,
      level: roleLabels[role],
      salaryGrossMonthly: 0,
      contract: 'A definir',
      coefficient: 'A definir',
      email: submission.email,
      phone: '',
      status: statusForConversionRole(role),
      site: selectedTeam.activeSites[0] || 'A affecter',
      activeSites: selectedTeam.activeSites,
      responsibilities: ['Fiche de poste a completer'],
      permissions: permissionsForConversionRole(role),
    }

    try {
      const usesSqlTeam = isDataConnectEnabled && user && isUuidLike(selectedTeam.id)

      if (usesSqlTeam) {
        member.id = await createTeamMemberInSql({
          teamId: selectedTeam.id,
          userId: null,
          firstName: member.firstName,
          lastName: member.lastName,
          title: member.title,
          qualification: member.qualification,
          level: member.level,
          salaryGrossMonthly: member.salaryGrossMonthly,
          contract: member.contract,
          coefficient: member.coefficient,
          email: member.email || null,
          phone: member.phone || null,
          status: member.status,
          site: member.site,
          activeSites: listToSqlValue(member.activeSites),
          responsibilities: listToSqlValue(member.responsibilities),
          permissions: permissionsToSqlValue(member.permissions),
        })
        convertedMemberId = member.id
      }

      await convertTeamProfileSubmissionInSql({
        id: submission.id,
        email: submission.email,
        nom: submission.nom,
        prenom: submission.prenom,
        role,
        avatar: buildInitials(submission.prenom, submission.nom),
        equipeTypeSouhaite: submission.requestedTeamType,
        equipeFinaleId: selectedTeam.id,
        poste: title,
        telephone: '',
        sourceConnexion: submission.sourceConnexion ?? 'onboarding',
        convertedMemberId,
        reviewNote: `Converti dans ${selectedTeam.name}`,
      })

      if (usesSqlTeam) {
        await updateTeamMemberInSql({
          id: member.id,
          teamId: selectedTeam.id,
          userId: submission.id,
          title: member.title,
          qualification: member.qualification,
          level: member.level,
          salaryGrossMonthly: member.salaryGrossMonthly,
          contract: member.contract,
          coefficient: member.coefficient,
          phone: member.phone || null,
          status: member.status,
          site: member.site,
          activeSites: listToSqlValue(member.activeSites),
          responsibilities: listToSqlValue(member.responsibilities),
          permissions: permissionsToSqlValue(member.permissions),
        })
        setTeamDirectorySource('sql')
      }
    } catch (error) {
      deny(`Conversion SQL impossible: ${error instanceof Error ? error.message : String(error)}`)
      return
    }

    setMembers(prev => [...prev, member])
    setSelectedMemberId(member.id)
    setProfileSubmissions(prev =>
      prev.map(item =>
        item.id === submission.id
          ? {
              ...item,
              status: 'converted',
              convertedTeamId: selectedTeam.id,
              convertedMemberId,
              reviewNote: `Converti dans ${selectedTeam.name}`,
            }
          : item,
      ),
    )
    setConversionDrafts(prev => {
      const next = { ...prev }
      delete next[submission.id]
      return next
    })
    deny(`${submission.prenom} ${submission.nom} est converti en profil applicatif et fiche equipe.`)
  }

  const selectedTheme = selectedTeam ? themeOptions[selectedTeam.theme] : null

  return (
    <div className="min-h-full bg-[#FAF6F2] p-6 xl:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#F06B21]">Administration interne</p>
          <h1 className="mt-2 text-[30px] font-semibold leading-tight text-[#1E1E1E]">Equipe, profils et droits</h1>
          <p className="mt-2 max-w-3xl text-[14px] leading-6 text-[#3C3C3C]">
            Reception des premieres connexions, classement en equipes finales, fiches de poste, conges, heures et preparation paie connectes a SQL quand la base est active.
          </p>
        </div>
        <button
          type="button"
          onClick={addTeam}
          disabled={!canCreateEquipe}
          className="inline-flex h-10 w-fit items-center gap-2 rounded-[14px] bg-[#F06B21] px-4 text-sm font-semibold text-white transition hover:bg-[#D95B17] disabled:cursor-not-allowed disabled:bg-[#9CA3AF]"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Creer l'equipe
        </button>
      </div>

      {permissionFeedback && (
        <div className="mb-5 flex items-center justify-between rounded-[14px] border border-[#F2E8DC] bg-white px-4 py-3 text-[13px] font-medium text-[#3C3C3C]">
          <span>{permissionFeedback}</span>
          <button type="button" onClick={() => setPermissionFeedback('')} className="text-[#F06B21] hover:text-[#D95B17]">OK</button>
        </div>
      )}

      <section className="mb-5 rounded-[20px] border border-[#F2E8DC] bg-white p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Reception profils et onboarding</h2>
              <span className={`rounded-[6px] px-2 py-1 text-[11px] font-semibold ${
                sqlProfileStatus === 'sql'
                  ? 'bg-[#E6F4EA] text-[#1E8E3E]'
                  : sqlProfileStatus === 'loading'
                    ? 'bg-[#FDEBDD] text-[#F06B21]'
                    : 'bg-[#FAF6F2] text-[#6B6B6B]'
              }`}>
                {sqlProfileStatus === 'sql' ? 'SQL User' : sqlProfileStatus === 'loading' ? 'Lecture SQL' : 'Fallback local'}
              </span>
            </div>
            <p className="mt-2 max-w-3xl text-[13px] leading-5 text-[#3C3C3C]">
              {sqlProfileMessage} Une demande onboarding ne donne aucun droit: la conversion en User SQL actif reste reservee au gerant.
            </p>
          </div>
          <div className="rounded-[14px] border border-[#F2E8DC] bg-[#FAF6F2] px-4 py-3 text-[12px] text-[#6B6B6B]">
            La transposition cree un User SQL actif et exige une equipe finale SQL; aucun droit n'est derive d'une fiche locale.
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-[13px] font-semibold text-[#1E1E1E]">Demandes a classer</h3>
            <span className="rounded-[6px] bg-[#FDEBDD] px-2 py-1 text-[11px] font-semibold text-[#F06B21]">
              {profileSubmissions.filter(submission => submission.status === 'pending').length} en attente
            </span>
          </div>
          {profileSubmissions.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {profileSubmissions.map(submission => {
                const alreadyMember = members.some(member => member.email.toLowerCase() === submission.email.toLowerCase())
                const isPending = submission.status === 'pending'
                const draft = getConversionDraft(submission)
                const roleOptions = getConversionRoleOptions(submission.requestedTeamType)
                const posteOptions = getPosteOptionsForRole(draft.role)
                return (
                  <div key={submission.id} className="rounded-[16px] border border-[#F2E8DC] bg-[#FAF6F2] p-4">
                    <div className="flex items-start gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#1E1E1E] text-[11px] font-bold text-white">
                        {buildInitials(submission.prenom, submission.nom)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-[#1E1E1E]">{submission.prenom} {submission.nom}</p>
                        <p className="mt-1 truncate text-[11px] text-[#6B6B6B]">{submission.email}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-[6px] bg-white px-2 py-1 text-[10px] font-semibold text-[#1E1E1E]">
                            {labelRequestedTeamType(submission.requestedTeamType)}
                          </span>
                          <span className={`rounded-[6px] px-2 py-1 text-[10px] font-semibold ${isPending ? 'bg-[#FDEBDD] text-[#F06B21]' : 'bg-[#E6F4EA] text-[#1E8E3E]'}`}>
                            {isPending ? 'A classer' : 'Converti'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isPending && (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">
                            Role applicatif
                          </span>
                          <select
                            value={draft.role}
                            onChange={event => {
                              const role = event.target.value as Role
                              updateConversionDraft(submission, { role, poste: defaultPosteForRole(role) })
                            }}
                            disabled={alreadyMember || !canAdminEquipe}
                            className="h-9 w-full rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-[12px] font-semibold text-[#1E1E1E] outline-none focus:border-[#F06B21] disabled:cursor-not-allowed disabled:bg-[#F5EEE7] disabled:text-[#9CA3AF]"
                          >
                            {roleOptions.map(role => (
                              <option key={role} value={role}>{role} - {roleLabels[role]}</option>
                            ))}
                          </select>
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">
                            Poste
                          </span>
                          <select
                            value={draft.poste}
                            onChange={event => updateConversionDraft(submission, { poste: event.target.value })}
                            disabled={alreadyMember || !canAdminEquipe}
                            className="h-9 w-full rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-[12px] font-semibold text-[#1E1E1E] outline-none focus:border-[#F06B21] disabled:cursor-not-allowed disabled:bg-[#F5EEE7] disabled:text-[#9CA3AF]"
                          >
                            {posteOptions.map(poste => (
                              <option key={poste} value={poste}>{poste}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => void convertSubmissionToSelectedTeam(submission)}
                      disabled={!isPending || alreadyMember || !selectedTeam || !canAdminEquipe || !draft.poste.trim()}
                      className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-[12px] bg-[#F06B21] px-3 text-[12px] font-semibold text-white transition hover:bg-[#D95B17] disabled:cursor-not-allowed disabled:bg-[#D99A72]"
                    >
                      <UserPlus className="h-4 w-4" strokeWidth={1.75} />
                      {alreadyMember ? 'Deja transpose' : selectedTeam ? `Valider vers ${selectedTeam.name}` : 'Selectionner une equipe'}
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="rounded-[14px] bg-[#FAF6F2] p-4 text-[13px] text-[#6B6B6B]">
              Aucune demande onboarding recue pour le moment.
            </p>
          )}
        </div>

        {sqlProfiles.length > 0 && (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {sqlProfiles.slice(0, 4).map(profile => (
              <div key={profile.id} className="rounded-[16px] border border-[#F2E8DC] bg-[#FAF6F2] p-3">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1E1E1E] text-[11px] font-bold text-white">
                    {profile.avatar}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-[#1E1E1E]">{profile.prenom} {profile.nom}</p>
                    <p className="mt-1 truncate text-[11px] text-[#6B6B6B]">{profile.email}</p>
                    <p className="mt-2 text-[11px] font-semibold text-[#F06B21]">
                      {profile.role ? roleLabels[profile.role] : profile.rawRole}
                    </p>
                    {profile.equipeTypeSouhaite && (
                      <p className="mt-1 text-[11px] text-[#6B6B6B]">
                        {labelRequestedTeamType(profile.equipeTypeSouhaite)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stats.map(stat => {
          const Icon = stat.Icon
          return (
            <section key={stat.label} className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
              <Icon className="h-5 w-5 text-[#F06B21]" strokeWidth={1.75} />
              <p className="mt-4 text-[28px] font-semibold leading-none text-[#1E1E1E]">{stat.value}</p>
              <p className="mt-2 text-[12px] font-medium text-[#6B6B6B]">{stat.label}</p>
            </section>
          )
        })}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[330px_minmax(0,1fr)_380px]">
        <aside className="space-y-5">
          <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Equipes par theme</h2>
              <span className="rounded-[6px] bg-[#FDEBDD] px-2 py-1 text-[11px] font-semibold text-[#F06B21]">
                {teams.length}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {teams.map(team => {
                const theme = themeOptions[team.theme]
                const isSelected = team.id === selectedTeam?.id
                const count = members.filter(member => member.teamId === team.id).length
                return (
                  <div
                    key={team.id}
                    className={`rounded-[14px] border transition ${
                      isSelected ? 'border-[#F06B21] bg-[#FDEBDD]' : 'border-[#F2E8DC] bg-white hover:bg-[#F9F7F3]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => selectTeam(team.id)}
                      className="flex w-full items-center gap-3 px-3 py-3 text-left"
                    >
                      <span className="h-11 w-1.5 rounded-full" style={{ backgroundColor: theme.edge }} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-[#1E1E1E]">{team.name}</span>
                        <span className="mt-1 block truncate text-[11px] text-[#6B6B6B]">{theme.label} - {count} membre(s)</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-[#9CA3AF]" strokeWidth={1.75} />
                    </button>
                    {isSelected && (
                      <div className="border-t border-[#F2E8DC] px-3 py-2">
                        <button
                          type="button"
                          onClick={() => deleteTeam(team.id)}
                          disabled={!canEditEquipe}
                          className="inline-flex h-8 items-center gap-2 rounded-[10px] px-2 text-[11px] font-semibold text-[#DC2626] transition hover:bg-[#FEE2E2] disabled:cursor-not-allowed disabled:text-[#9CA3AF]"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                          Supprimer equipe
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
              {teams.length === 0 && (
                <p className="rounded-[14px] bg-[#FAF6F2] p-4 text-[13px] leading-5 text-[#6B6B6B]">
                  Aucune equipe pour le moment. Creez la premiere avec le formulaire ci-dessous.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
            <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Nouvelle equipe</h2>
            <div className="mt-4 space-y-3">
              <input value={teamDraft.name} onChange={event => setTeamDraft(prev => ({ ...prev, name: event.target.value }))} placeholder="Nom de l'equipe" className="h-10 w-full rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] text-[#1E1E1E] outline-none focus:border-[#F06B21]" />
              <select value={teamDraft.theme} onChange={event => setTeamDraft(prev => ({ ...prev, theme: event.target.value as TeamTheme }))} className="h-10 w-full rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] text-[#1E1E1E] outline-none focus:border-[#F06B21]">
                {Object.entries(themeOptions).map(([value, theme]) => <option key={value} value={value}>{theme.label}</option>)}
              </select>
              <input value={teamDraft.lead} onChange={event => setTeamDraft(prev => ({ ...prev, lead: event.target.value }))} placeholder="Responsable" className="h-10 w-full rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] text-[#1E1E1E] outline-none focus:border-[#F06B21]" />
              <input value={teamDraft.activeSites} onChange={event => setTeamDraft(prev => ({ ...prev, activeSites: event.target.value }))} placeholder="Chantiers separes par virgules" className="h-10 w-full rounded-[14px] border border-[#F2E8DC] bg-white px-3 text-[13px] text-[#1E1E1E] outline-none focus:border-[#F06B21]" />
              <textarea value={teamDraft.description} onChange={event => setTeamDraft(prev => ({ ...prev, description: event.target.value }))} placeholder="Mission de l'equipe" rows={3} className="w-full resize-none rounded-[14px] border border-[#F2E8DC] bg-white px-3 py-2 text-[13px] text-[#1E1E1E] outline-none focus:border-[#F06B21]" />
            </div>
          </section>
        </aside>

        <main className="min-w-0 space-y-5">
          {selectedTeam && selectedTheme ? (
            <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <span className="inline-flex rounded-[8px] px-2.5 py-1 text-[11px] font-semibold" style={{ backgroundColor: selectedTheme.bg, color: selectedTheme.text }}>
                    {selectedTheme.label}
                  </span>
                  <h2 className="mt-3 text-[22px] font-semibold text-[#1E1E1E]">{selectedTeam.name}</h2>
                  <p className="mt-2 text-[13px] leading-5 text-[#3C3C3C]">{selectedTeam.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedTeam.activeSites.map(site => (
                      <span key={site} className="rounded-[6px] bg-[#FAF6F2] px-2.5 py-1 text-[11px] font-semibold text-[#6B6B6B]">{site}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-[14px] border border-[#F2E8DC] bg-[#FAF6F2] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">Responsable</p>
                  <p className="mt-1 text-[13px] font-semibold text-[#1E1E1E]">{selectedTeam.lead}</p>
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
              <div className="rounded-[16px] bg-[#FAF6F2] p-5">
                <p className="text-[15px] font-semibold text-[#1E1E1E]">Aucune equipe selectionnee</p>
                <p className="mt-2 text-[13px] leading-5 text-[#6B6B6B]">
                  La liste est vide. Ajoutez les vraies equipes Sosson pour commencer a creer les fiches membres.
                </p>
              </div>
            </section>
          )}

          <section className="rounded-[20px] border border-[#F2E8DC] bg-white">
            <div className="flex items-center justify-between border-b border-[#F2E8DC] px-5 py-4">
              <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Membres et fiches de poste</h2>
              <span className="text-[12px] text-[#6B6B6B]">{selectedTeamMembers.length} fiche(s)</span>
            </div>
            <div className="grid gap-3 p-5 md:grid-cols-2">
              {selectedTeamMembers.map(member => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelectedMemberId(member.id)}
                  className={`rounded-[16px] border p-4 text-left transition ${
                    selectedMember?.id === member.id ? 'border-[#F06B21] bg-[#FDEBDD]' : 'border-[#F2E8DC] bg-white hover:bg-[#F9F7F3]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#1E1E1E] text-[12px] font-bold text-white">{getInitials(member)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-semibold text-[#1E1E1E]">{member.firstName} {member.lastName}</span>
                      <span className="mt-1 block truncate text-[12px] text-[#6B6B6B]">{member.title}</span>
                      <span className="mt-1 block truncate text-[11px] text-[#6B6B6B]">{member.qualification}</span>
                    </span>
                    <span className={`rounded-[6px] px-2 py-1 text-[11px] font-semibold ${statusClass(member.status)}`}>{statusLabels[member.status]}</span>
                  </div>
                </button>
              ))}
              {selectedTeamMembers.length === 0 && (
                <p className="rounded-[14px] bg-[#FAF6F2] p-4 text-[13px] text-[#6B6B6B] md:col-span-2">
                  {selectedTeam ? 'Aucun membre dans cette equipe.' : "Creez une equipe avant d'ajouter des membres."}
                </p>
              )}
            </div>
          </section>

          <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#FDEBDD] text-[#F06B21]">
                <UserPlus className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Ajouter un membre</h2>
                <p className="text-[12px] text-[#6B6B6B]">
                  {selectedTeam ? "La fiche est enregistree en SQL quand l'equipe selectionnee vient de la base; le local reste un fallback annonce." : "Creez une equipe avant d'ajouter une fiche membre."}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input value={memberDraft.firstName} onChange={event => setMemberDraft(prev => ({ ...prev, firstName: event.target.value }))} placeholder="Prenom" className="h-10 rounded-[14px] border border-[#F2E8DC] px-3 text-[13px] outline-none focus:border-[#F06B21]" />
              <input value={memberDraft.lastName} onChange={event => setMemberDraft(prev => ({ ...prev, lastName: event.target.value }))} placeholder="Nom" className="h-10 rounded-[14px] border border-[#F2E8DC] px-3 text-[13px] outline-none focus:border-[#F06B21]" />
              <input value={memberDraft.title} onChange={event => setMemberDraft(prev => ({ ...prev, title: event.target.value }))} placeholder="Poste" className="h-10 rounded-[14px] border border-[#F2E8DC] px-3 text-[13px] outline-none focus:border-[#F06B21]" />
              <input value={memberDraft.qualification} onChange={event => setMemberDraft(prev => ({ ...prev, qualification: event.target.value }))} placeholder="Qualification" className="h-10 rounded-[14px] border border-[#F2E8DC] px-3 text-[13px] outline-none focus:border-[#F06B21]" />
              <input value={memberDraft.level} onChange={event => setMemberDraft(prev => ({ ...prev, level: event.target.value }))} placeholder="Niveau / role terrain" className="h-10 rounded-[14px] border border-[#F2E8DC] px-3 text-[13px] outline-none focus:border-[#F06B21]" />
              <input value={memberDraft.salaryGrossMonthly} onChange={event => setMemberDraft(prev => ({ ...prev, salaryGrossMonthly: event.target.value }))} placeholder="Salaire brut mensuel" type="number" min="0" className="h-10 rounded-[14px] border border-[#F2E8DC] px-3 text-[13px] outline-none focus:border-[#F06B21]" />
              <input value={memberDraft.contract} onChange={event => setMemberDraft(prev => ({ ...prev, contract: event.target.value }))} placeholder="Contrat" className="h-10 rounded-[14px] border border-[#F2E8DC] px-3 text-[13px] outline-none focus:border-[#F06B21]" />
              <input value={memberDraft.coefficient} onChange={event => setMemberDraft(prev => ({ ...prev, coefficient: event.target.value }))} placeholder="Coefficient BTP" className="h-10 rounded-[14px] border border-[#F2E8DC] px-3 text-[13px] outline-none focus:border-[#F06B21]" />
              <input value={memberDraft.email} onChange={event => setMemberDraft(prev => ({ ...prev, email: event.target.value }))} placeholder="Email" className="h-10 rounded-[14px] border border-[#F2E8DC] px-3 text-[13px] outline-none focus:border-[#F06B21]" />
              <input value={memberDraft.phone} onChange={event => setMemberDraft(prev => ({ ...prev, phone: event.target.value }))} placeholder="Telephone" className="h-10 rounded-[14px] border border-[#F2E8DC] px-3 text-[13px] outline-none focus:border-[#F06B21]" />
              <select value={memberDraft.status} onChange={event => setMemberDraft(prev => ({ ...prev, status: event.target.value as MemberStatus }))} className="h-10 rounded-[14px] border border-[#F2E8DC] px-3 text-[13px] outline-none focus:border-[#F06B21]">
                {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <input value={memberDraft.site} onChange={event => setMemberDraft(prev => ({ ...prev, site: event.target.value }))} placeholder="Affectation principale" className="h-10 rounded-[14px] border border-[#F2E8DC] px-3 text-[13px] outline-none focus:border-[#F06B21]" />
              <textarea value={memberDraft.activeSites} onChange={event => setMemberDraft(prev => ({ ...prev, activeSites: event.target.value }))} placeholder="Chantiers suivis, separes par virgules" rows={2} className="resize-none rounded-[14px] border border-[#F2E8DC] px-3 py-2 text-[13px] outline-none focus:border-[#F06B21]" />
              <textarea value={memberDraft.responsibilities} onChange={event => setMemberDraft(prev => ({ ...prev, responsibilities: event.target.value }))} placeholder="Responsabilites separees par virgules" rows={2} className="resize-none rounded-[14px] border border-[#F2E8DC] px-3 py-2 text-[13px] outline-none focus:border-[#F06B21]" />
            </div>
            <button type="button" onClick={addMember} disabled={!selectedTeam || !canCreateEquipe} className="mt-4 inline-flex h-10 items-center gap-2 rounded-[14px] bg-[#1E1E1E] px-4 text-[13px] font-semibold text-white transition hover:bg-[#2A2A2A] disabled:cursor-not-allowed disabled:bg-[#9CA3AF]">
              <Plus className="h-4 w-4" strokeWidth={2} />
              Ajouter a l'equipe
            </button>
          </section>
        </main>

        <aside className="space-y-5">
          <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#FDEBDD] text-[#F06B21]">
                <BriefcaseBusiness className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Fiche de poste</h2>
                <p className="text-[12px] text-[#6B6B6B]">Membre selectionne</p>
              </div>
            </div>

            {selectedMember ? (
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[#1E1E1E] text-[13px] font-bold text-white">{getInitials(selectedMember)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[16px] font-semibold text-[#1E1E1E]">{selectedMember.firstName} {selectedMember.lastName}</p>
                    <p className="truncate text-[12px] text-[#6B6B6B]">{selectedMember.title}</p>
                  </div>
                </div>

                <div className="grid gap-3 rounded-[14px] bg-[#FAF6F2] p-4 text-[12px]">
                  <InfoLine label="Qualification" value={selectedMember.qualification} />
                  <InfoLine label="Contrat" value={selectedMember.contract} />
                  <InfoLine label="Coefficient" value={selectedMember.coefficient} />
                  <InfoLine label="Salaire brut" value={formatSalary(selectedMember.salaryGrossMonthly)} />
                  <select value={selectedMember.teamId} onChange={event => void moveMemberToTeam(selectedMember.id, event.target.value)} disabled={!canEditEquipe || (isDataConnectEnabled && isUuidLike(selectedMember.id) && !canAdminEquipe)} className="h-9 rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-[12px] text-[#1E1E1E] outline-none disabled:cursor-not-allowed disabled:bg-[#FAF6F2] disabled:text-[#9CA3AF] focus:border-[#F06B21]">
                    {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                  </select>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-[13px] font-semibold text-[#1E1E1E]">
                    <ClipboardList className="h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
                    Responsabilites
                  </h3>
                  <div className="mt-3 space-y-2">
                    {selectedMember.responsibilities.map(item => (
                      <div key={item} className="flex gap-2 text-[12px] text-[#3C3C3C]">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1E8E3E]" strokeWidth={1.75} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link to={`/equipe/profils/${selectedMember.id}`} className="inline-flex min-h-9 items-center gap-2 rounded-[12px] border border-[#F2E8DC] bg-[#FAF6F2] px-3 py-2 text-[12px] font-semibold text-[#1E1E1E] transition hover:border-[#F06B21] hover:text-[#F06B21]">
                    Ouvrir la fiche RH complete
                  </Link>
                  <button type="button" onClick={() => deleteMember(selectedMember.id)} disabled={!canEditEquipe} className="inline-flex h-9 items-center gap-2 rounded-[12px] border border-[#FCA5A5] bg-white px-3 text-[12px] font-semibold text-[#DC2626] transition hover:bg-[#FEE2E2] disabled:cursor-not-allowed disabled:border-[#F2E8DC] disabled:text-[#9CA3AF]">
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    Supprimer
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-5 rounded-[14px] bg-[#FAF6F2] p-4 text-[13px] text-[#6B6B6B]">Aucun membre dans cette equipe.</p>
            )}
          </section>

          <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#FDEBDD] text-[#F06B21]">
                <CalendarDays className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Conges 12 mois</h2>
                <p className="text-[12px] text-[#6B6B6B]">Planning du membre selectionne</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {planningMonths.map(month => {
                const monthLeaves = selectedMemberLeaves.filter(leave => leave.month === month)
                return (
                  <div key={month} className="min-h-[58px] rounded-[10px] border border-[#F2E8DC] bg-[#FAF6F2] p-2">
                    <p className="text-[11px] font-semibold text-[#1E1E1E]">{month.slice(0, 3)}</p>
                    <div className="mt-1 space-y-1">
                      {monthLeaves.map(leave => (
                        <button key={leave.id} type="button" onClick={() => deleteLeave(leave.id)} disabled={!canEditEquipe} className="block w-full truncate rounded-[6px] bg-[#FDEBDD] px-1.5 py-1 text-left text-[10px] font-semibold text-[#F06B21] disabled:cursor-not-allowed disabled:bg-[#FAF6F2] disabled:text-[#9CA3AF]">
                          {leave.startDay}-{leave.endDay}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <select value={leaveDraft.type} onChange={event => setLeaveDraft(prev => ({ ...prev, type: event.target.value as LeaveType }))} className="h-9 rounded-[10px] border border-[#F2E8DC] px-2 text-[12px] outline-none focus:border-[#F06B21]">
                {Object.entries(leaveTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <select value={leaveDraft.month} onChange={event => setLeaveDraft(prev => ({ ...prev, month: event.target.value }))} className="h-9 rounded-[10px] border border-[#F2E8DC] px-2 text-[12px] outline-none focus:border-[#F06B21]">
                {planningMonths.map(month => <option key={month} value={month}>{month}</option>)}
              </select>
              <input value={leaveDraft.startDay} onChange={event => setLeaveDraft(prev => ({ ...prev, startDay: Number(event.target.value) }))} type="number" min="1" max="31" className="h-9 rounded-[10px] border border-[#F2E8DC] px-2 text-[12px] outline-none focus:border-[#F06B21]" />
              <input value={leaveDraft.endDay} onChange={event => setLeaveDraft(prev => ({ ...prev, endDay: Number(event.target.value) }))} type="number" min="1" max="31" className="h-9 rounded-[10px] border border-[#F2E8DC] px-2 text-[12px] outline-none focus:border-[#F06B21]" />
              <input value={leaveDraft.note} onChange={event => setLeaveDraft(prev => ({ ...prev, note: event.target.value }))} placeholder="Note" className="col-span-2 h-9 rounded-[10px] border border-[#F2E8DC] px-2 text-[12px] outline-none focus:border-[#F06B21]" />
            </div>
            <button type="button" onClick={() => void addLeave()} disabled={!selectedMember || !canEditEquipe} className="mt-3 inline-flex h-9 items-center gap-2 rounded-[12px] bg-[#1E1E1E] px-3 text-[12px] font-semibold text-white transition hover:bg-[#2A2A2A] disabled:cursor-not-allowed disabled:bg-[#9CA3AF]">
              <Plus className="h-4 w-4" strokeWidth={2} />
              Poser conges
            </button>
          </section>

          <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#FDEBDD] text-[#F06B21]">
                <Clock3 className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Heures</h2>
                <p className="text-[12px] text-[#6B6B6B]">Saisie rapide SQL</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <input value={timeDraft.workDate} onChange={event => setTimeDraft(prev => ({ ...prev, workDate: event.target.value }))} type="date" className="h-9 rounded-[10px] border border-[#F2E8DC] px-2 text-[12px] outline-none focus:border-[#F06B21]" />
              <input value={timeDraft.hours} onChange={event => setTimeDraft(prev => ({ ...prev, hours: event.target.value }))} type="number" min="0" step="0.25" className="h-9 rounded-[10px] border border-[#F2E8DC] px-2 text-[12px] outline-none focus:border-[#F06B21]" />
              <select value={timeDraft.kind} onChange={event => setTimeDraft(prev => ({ ...prev, kind: event.target.value }))} className="col-span-2 h-9 rounded-[10px] border border-[#F2E8DC] px-2 text-[12px] outline-none focus:border-[#F06B21]">
                <option value="chantier">Chantier</option>
                <option value="atelier">Atelier</option>
                <option value="bureau">Bureau</option>
                <option value="formation">Formation</option>
              </select>
              <input value={timeDraft.notes} onChange={event => setTimeDraft(prev => ({ ...prev, notes: event.target.value }))} placeholder="Note heures" className="col-span-2 h-9 rounded-[10px] border border-[#F2E8DC] px-2 text-[12px] outline-none focus:border-[#F06B21]" />
            </div>
            <button type="button" onClick={() => void addWorkTimeEntry()} disabled={!selectedMember || !canEditEquipe} className="mt-3 inline-flex h-9 items-center gap-2 rounded-[12px] bg-[#1E1E1E] px-3 text-[12px] font-semibold text-white transition hover:bg-[#2A2A2A] disabled:cursor-not-allowed disabled:bg-[#9CA3AF]">
              <Plus className="h-4 w-4" strokeWidth={2} />
              Enregistrer heures
            </button>
          </section>

          <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#FDEBDD] text-[#F06B21]">
                <Euro className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Preparation paie</h2>
                <p className="text-[12px] text-[#6B6B6B]">Brouillon mensuel, non bulletin legal</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <input value={payrollDraft.periodLabel} onChange={event => setPayrollDraft(prev => ({ ...prev, periodLabel: event.target.value }))} placeholder="AAAA-MM" className="col-span-2 h-9 rounded-[10px] border border-[#F2E8DC] px-2 text-[12px] outline-none focus:border-[#F06B21]" />
              <input value={payrollDraft.overtimeHours} onChange={event => setPayrollDraft(prev => ({ ...prev, overtimeHours: event.target.value }))} type="number" min="0" step="0.25" placeholder="Heures sup." className="h-9 rounded-[10px] border border-[#F2E8DC] px-2 text-[12px] outline-none focus:border-[#F06B21]" />
              <input value={payrollDraft.paidLeaveDays} onChange={event => setPayrollDraft(prev => ({ ...prev, paidLeaveDays: event.target.value }))} type="number" min="0" step="0.5" placeholder="CP jours" className="h-9 rounded-[10px] border border-[#F2E8DC] px-2 text-[12px] outline-none focus:border-[#F06B21]" />
              <input value={payrollDraft.absenceDays} onChange={event => setPayrollDraft(prev => ({ ...prev, absenceDays: event.target.value }))} type="number" min="0" step="0.5" placeholder="Absence jours" className="h-9 rounded-[10px] border border-[#F2E8DC] px-2 text-[12px] outline-none focus:border-[#F06B21]" />
              <input value={payrollDraft.notes} onChange={event => setPayrollDraft(prev => ({ ...prev, notes: event.target.value }))} placeholder="Note paie" className="h-9 rounded-[10px] border border-[#F2E8DC] px-2 text-[12px] outline-none focus:border-[#F06B21]" />
            </div>
            <button type="button" onClick={() => void addPayrollPeriod()} disabled={!selectedMember || !canAdminEquipe} className="mt-3 inline-flex h-9 items-center gap-2 rounded-[12px] bg-[#1E1E1E] px-3 text-[12px] font-semibold text-white transition hover:bg-[#2A2A2A] disabled:cursor-not-allowed disabled:bg-[#9CA3AF]">
              <Plus className="h-4 w-4" strokeWidth={2} />
              Creer brouillon
            </button>
          </section>
        </aside>
      </div>

      <section className="mt-5 rounded-[20px] border border-[#F2E8DC] bg-white">
        <div className="flex flex-col gap-4 border-b border-[#F2E8DC] px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Droits et permissions</h2>
            <p className="mt-1 text-[12px] text-[#6B6B6B]">Les changements modifient la navigation et le garde d'acces du site.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (canAdminEquipe) setAccessMatrix(defaultAccessMatrix)
              else deny('Reinitialisation des droits non autorisee pour ce profil.')
            }}
            disabled={!canAdminEquipe}
            className="inline-flex h-9 w-fit items-center gap-2 rounded-[12px] border border-[#F2E8DC] bg-white px-3 text-[12px] font-semibold text-[#1E1E1E] transition hover:bg-[#FAF6F2] disabled:cursor-not-allowed disabled:text-[#9CA3AF]"
          >
            <LockKeyhole className="h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
            Reinitialiser
          </button>
        </div>

        <div className="grid gap-0 xl:grid-cols-[260px_minmax(0,1fr)]">
          <div className="border-b border-[#F2E8DC] p-5 xl:border-b-0 xl:border-r">
            <div className="space-y-2">
              {roles.map(role => (
                <button key={role} type="button" onClick={() => setSelectedRole(role)} className={`flex w-full items-center justify-between rounded-[14px] px-3 py-3 text-left transition ${selectedRole === role ? 'bg-[#FDEBDD] text-[#1E1E1E]' : 'hover:bg-[#FAF6F2]'}`}>
                  <span>
                    <span className="block text-[13px] font-semibold">{roleLabels[role]}</span>
                    <span className="mt-1 block text-[11px] text-[#6B6B6B]">{accessSummary(accessMatrix[role])}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#9CA3AF]" strokeWidth={1.75} />
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-[14px] bg-[#FAF6F2] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B6B6B]">Profil teste</p>
              <p className="mt-2 text-[18px] font-semibold text-[#1E1E1E]">{roleStats.visible}/{roleStats.pages}</p>
              <p className="mt-1 text-[12px] text-[#6B6B6B]">{roleStats.editable} pages modifiables</p>
            </div>
          </div>

          <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
            {appPages.map(page => (
              <div key={page.key} className="rounded-[16px] border border-[#F2E8DC] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-semibold text-[#1E1E1E]">{page.label}</p>
                    <p className="mt-1 text-[11px] text-[#6B6B6B]">{page.group}</p>
                  </div>
                  <span className={`rounded-[6px] px-2 py-1 text-[10px] font-semibold ${accessMatrix[selectedRole][page.key].view ? 'bg-[#E6F4EA] text-[#1E8E3E]' : 'bg-[#FEE2E2] text-[#DC2626]'}`}>
                    {accessMatrix[selectedRole][page.key].view ? 'Ouvert' : 'Bloque'}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {accessCapabilities.map(capability => {
                    const active = accessMatrix[selectedRole][page.key][capability]
                    return (
                      <button key={capability} type="button" onClick={() => toggleCapability(selectedRole, page.key, capability)} disabled={!canAdminEquipe} className={`h-8 rounded-[8px] text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${active ? 'bg-[#1E1E1E] text-white' : 'border border-[#F2E8DC] bg-white text-[#6B6B6B] hover:bg-[#FAF6F2]'}`} aria-pressed={active}>
                        {capabilityLabels[capability]}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-semibold text-[#1E1E1E]">{label}</p>
      <p className="mt-1 text-[#6B6B6B]">{value}</p>
    </div>
  )
}

function splitList(value: string, fallback: string[]) {
  const items = value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
  return items.length ? items : fallback
}

function clampDay(day: number) {
  if (Number.isNaN(day)) return 1
  return Math.max(1, Math.min(31, day))
}

function accessSummary(roleAccess: Record<PagePermissionKey, Record<AccessCapability, boolean>>) {
  const visible = appPages.filter(page => roleAccess[page.key].view).length
  return `${visible} pages visibles`
}
