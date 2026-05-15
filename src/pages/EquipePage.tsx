import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  ExternalLink,
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
import {
  accessCapabilities,
  appPages,
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

const roles: Role[] = ['gerant', 'assistante', 'chef_chantier']

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

export function EquipePage() {
  const { accessMatrix, setAccessMatrix } = useApp()
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

  useEffect(() => {
    saveCollection(TEAMS_STORAGE_KEY, teams)
  }, [teams])

  useEffect(() => {
    saveCollection(MEMBERS_STORAGE_KEY, members)
  }, [members])

  useEffect(() => {
    saveCollection(LEAVES_STORAGE_KEY, leaves)
  }, [leaves])

  const selectedTeam = teams.find(team => team.id === selectedTeamId) ?? teams[0]
  const selectedTeamMembers = useMemo(
    () => members.filter(member => member.teamId === selectedTeam?.id),
    [members, selectedTeam?.id]
  )
  const selectedMember = members.find(member => member.id === selectedMemberId) ?? selectedTeamMembers[0]
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
      { label: 'Conges poses', value: String(leaveCount), Icon: CalendarDays },
      { label: 'Pages controlees', value: String(controlledPages), Icon: ShieldCheck },
    ]
  }, [accessMatrix, leaves.length, members, teams])

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

  function addTeam() {
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

    setTeams(prev => [...prev, team])
    setSelectedTeamId(team.id)
    setSelectedMemberId('')
    setTeamDraft({ name: '', theme: 'charpente', lead: '', description: '', activeSites: '' })
  }

  function deleteTeam(teamId: string) {
    if (teams.length <= 1) return
    const deletedMemberIds = members.filter(member => member.teamId === teamId).map(member => member.id)
    const remainingTeams = teams.filter(team => team.id !== teamId)
    const nextTeam = remainingTeams[0]

    setTeams(remainingTeams)
    setMembers(prev => prev.filter(member => member.teamId !== teamId))
    setLeaves(prev => prev.filter(leave => !deletedMemberIds.includes(leave.memberId)))
    setSelectedTeamId(nextTeam?.id ?? '')
    setSelectedMemberId(members.find(member => member.teamId === nextTeam?.id)?.id ?? '')
  }

  function addMember() {
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
    const remaining = members.filter(member => member.id !== memberId)
    setMembers(remaining)
    setLeaves(prev => prev.filter(leave => leave.memberId !== memberId))
    setSelectedMemberId(remaining.find(member => member.teamId === selectedTeam?.id)?.id ?? '')
  }

  function moveMemberToTeam(memberId: string, teamId: string) {
    setMembers(prev => prev.map(member => (member.id === memberId ? { ...member, teamId } : member)))
  }

  function addLeave() {
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

    setLeaves(prev => [...prev, leave])
    setLeaveDraft(prev => ({ ...prev, note: '' }))
  }

  function deleteLeave(leaveId: string) {
    setLeaves(prev => prev.filter(leave => leave.id !== leaveId))
  }

  function toggleCapability(role: Role, pageKey: PagePermissionKey, capability: AccessCapability) {
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

  if (!selectedTeam) return null

  const selectedTheme = themeOptions[selectedTeam.theme]

  return (
    <div className="min-h-full bg-[#FAF6F2] p-6 xl:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#F06B21]">Administration interne</p>
          <h1 className="mt-2 text-[30px] font-semibold leading-tight text-[#1E1E1E]">Equipe, profils et droits</h1>
          <p className="mt-2 max-w-3xl text-[14px] leading-6 text-[#3C3C3C]">
            Deux equipes chantier fictives mais coherentes pour la construction de maisons ossature bois, avec fiches de poste, salaires, congés 12 mois et permissions par profil.
          </p>
        </div>
        <button
          type="button"
          onClick={addTeam}
          className="inline-flex h-10 w-fit items-center gap-2 rounded-[14px] bg-[#F06B21] px-4 text-sm font-semibold text-white transition hover:bg-[#D95B17]"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Creer l'equipe
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
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
                const isSelected = team.id === selectedTeam.id
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
                          disabled={teams.length <= 1}
                          className="inline-flex h-8 items-center gap-2 rounded-[10px] px-2 text-[11px] font-semibold text-[#DC2626] transition hover:bg-[#FEE2E2] disabled:cursor-not-allowed disabled:text-[#9CA3AF] disabled:hover:bg-transparent"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                          Supprimer equipe
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
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
            </div>
          </section>

          <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#FDEBDD] text-[#F06B21]">
                <UserPlus className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Ajouter un membre</h2>
                <p className="text-[12px] text-[#6B6B6B]">La fiche sera enregistree dans la base locale de l'equipe selectionnee.</p>
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
            <button type="button" onClick={addMember} className="mt-4 inline-flex h-10 items-center gap-2 rounded-[14px] bg-[#1E1E1E] px-4 text-[13px] font-semibold text-white transition hover:bg-[#2A2A2A]">
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
                  <select value={selectedMember.teamId} onChange={event => moveMemberToTeam(selectedMember.id, event.target.value)} className="h-9 rounded-[10px] border border-[#F2E8DC] bg-white px-3 text-[12px] text-[#1E1E1E] outline-none focus:border-[#F06B21]">
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
                  <Link to={`/equipe/profils/${selectedMember.id}`} className="inline-flex h-9 items-center gap-2 rounded-[12px] bg-[#F06B21] px-3 text-[12px] font-semibold text-white transition hover:bg-[#D95B17]">
                    <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
                    Ouvrir profil
                  </Link>
                  <button type="button" onClick={() => deleteMember(selectedMember.id)} className="inline-flex h-9 items-center gap-2 rounded-[12px] border border-[#FCA5A5] bg-white px-3 text-[12px] font-semibold text-[#DC2626] transition hover:bg-[#FEE2E2]">
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
                        <button key={leave.id} type="button" onClick={() => deleteLeave(leave.id)} className="block w-full truncate rounded-[6px] bg-[#FDEBDD] px-1.5 py-1 text-left text-[10px] font-semibold text-[#F06B21]">
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
            <button type="button" onClick={addLeave} disabled={!selectedMember} className="mt-3 inline-flex h-9 items-center gap-2 rounded-[12px] bg-[#1E1E1E] px-3 text-[12px] font-semibold text-white transition hover:bg-[#2A2A2A] disabled:cursor-not-allowed disabled:bg-[#9CA3AF]">
              <Plus className="h-4 w-4" strokeWidth={2} />
              Poser conges
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
          <button type="button" onClick={() => setAccessMatrix(defaultAccessMatrix)} className="inline-flex h-9 w-fit items-center gap-2 rounded-[12px] border border-[#F2E8DC] bg-white px-3 text-[12px] font-semibold text-[#1E1E1E] transition hover:bg-[#FAF6F2]">
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
                      <button key={capability} type="button" onClick={() => toggleCapability(selectedRole, page.key, capability)} className={`h-8 rounded-[8px] text-[11px] font-semibold transition ${active ? 'bg-[#1E1E1E] text-white' : 'border border-[#F2E8DC] bg-white text-[#6B6B6B] hover:bg-[#FAF6F2]'}`} aria-pressed={active}>
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
