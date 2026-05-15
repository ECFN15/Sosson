import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Euro,
  HardHat,
  Mail,
  Phone,
  Plus,
  Trash2,
} from 'lucide-react'
import {
  createId,
  formatSalary,
  getInitials,
  leaveTypeLabels,
  LEAVES_STORAGE_KEY,
  loadLeaves,
  loadMembers,
  loadTeams,
  planningMonths,
  saveCollection,
  themeOptions,
} from '@/lib/teamDirectory'
import type { LeavePeriod, LeaveType } from '@/lib/teamDirectory'
import { appPages } from '@/lib/accessControl'

export function EquipeProfilePage() {
  const { memberId } = useParams()
  const [teams] = useState(() => loadTeams())
  const [members] = useState(() => loadMembers())
  const [leaves, setLeaves] = useState<LeavePeriod[]>(() => loadLeaves())
  const [leaveDraft, setLeaveDraft] = useState({
    type: 'conges' as LeaveType,
    month: 'Aout',
    startDay: 1,
    endDay: 5,
    note: '',
  })

  const member = members.find(item => item.id === memberId)
  const team = teams.find(item => item.id === member?.teamId)
  const memberLeaves = useMemo(
    () => leaves.filter(leave => leave.memberId === member?.id),
    [leaves, member?.id]
  )

  useEffect(() => {
    saveCollection(LEAVES_STORAGE_KEY, leaves)
  }, [leaves])

  if (!member || !team) return <Navigate to="/equipe" replace />

  const theme = themeOptions[team.theme]

  function addLeave() {
    if (!member) return
    const startDay = clampDay(leaveDraft.startDay)
    const endDay = Math.max(startDay, clampDay(leaveDraft.endDay))
    const leave: LeavePeriod = {
      id: createId('leave'),
      memberId: member.id,
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

  return (
    <div className="min-h-full bg-[#FAF6F2] p-6 xl:p-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <Link to="/equipe" className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#F06B21]">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            Retour equipe
          </Link>
          <h1 className="mt-3 text-[30px] font-semibold leading-tight text-[#1E1E1E]">
            Profil de {member.firstName} {member.lastName}
          </h1>
          <p className="mt-2 max-w-3xl text-[14px] leading-6 text-[#3C3C3C]">
            Fiche individuelle RH et operationnelle : qualification, salaire, affectations, droits utiles et planning annuel des conges.
          </p>
        </div>
        <span className="inline-flex w-fit rounded-[8px] px-3 py-1.5 text-[12px] font-semibold" style={{ backgroundColor: theme.bg, color: theme.text }}>
          {team.name}
        </span>
      </div>

      <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-[#1E1E1E] text-[16px] font-bold text-white">
                {getInitials(member)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[20px] font-semibold text-[#1E1E1E]">{member.firstName} {member.lastName}</p>
                <p className="mt-1 truncate text-[13px] text-[#6B6B6B]">{member.title}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 rounded-[14px] bg-[#FAF6F2] p-4 text-[12px]">
              <InfoRow label="Qualification" value={member.qualification} />
              <InfoRow label="Niveau" value={member.level} />
              <InfoRow label="Contrat" value={member.contract} />
              <InfoRow label="Coefficient" value={member.coefficient} />
              <InfoRow label="Affectation" value={member.site} />
            </div>
          </section>

          <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
            <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Contact et salaire</h2>
            <div className="mt-4 space-y-3 text-[13px]">
              <div className="flex items-center gap-3 rounded-[14px] bg-[#FAF6F2] px-3 py-3">
                <Mail className="h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
                <span className="truncate text-[#3C3C3C]">{member.email || 'Email non renseigne'}</span>
              </div>
              <div className="flex items-center gap-3 rounded-[14px] bg-[#FAF6F2] px-3 py-3">
                <Phone className="h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
                <span className="truncate text-[#3C3C3C]">{member.phone || 'Telephone non renseigne'}</span>
              </div>
              <div className="flex items-center gap-3 rounded-[14px] bg-[#FAF6F2] px-3 py-3">
                <Euro className="h-4 w-4 text-[#F06B21]" strokeWidth={1.75} />
                <span className="font-semibold text-[#1E1E1E]">{formatSalary(member.salaryGrossMonthly)} brut / mois</span>
              </div>
            </div>
          </section>
        </aside>

        <main className="space-y-5">
          <section className="grid gap-4 md:grid-cols-3">
            <SummaryCard label="Equipe" value={team.name} Icon={HardHat} />
            <SummaryCard label="Chantiers actifs" value={String(member.activeSites.length)} Icon={CheckCircle2} />
            <SummaryCard label="Conges poses" value={String(memberLeaves.length)} Icon={CalendarDays} />
          </section>

          <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
            <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Responsabilites</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {member.responsibilities.map(item => (
                <div key={item} className="flex items-start gap-3 rounded-[14px] border border-[#F2E8DC] bg-white p-3 text-[13px] text-[#3C3C3C]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1E8E3E]" strokeWidth={1.75} />
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
            <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Chantiers suivis</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {member.activeSites.map(site => (
                <span key={site} className="rounded-[8px] bg-[#FDEBDD] px-3 py-1.5 text-[12px] font-semibold text-[#F06B21]">
                  {site}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
            <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Pages utiles</h2>
            <div className="mt-4 grid gap-2 md:grid-cols-3">
              {member.permissions.map(permission => {
                const page = appPages.find(item => item.key === permission)
                return page ? (
                  <div key={permission} className="rounded-[12px] border border-[#F2E8DC] bg-[#FAF6F2] px-3 py-3">
                    <p className="text-[12px] font-semibold text-[#1E1E1E]">{page.label}</p>
                    <p className="mt-1 text-[11px] text-[#6B6B6B]">{page.group}</p>
                  </div>
                ) : null
              })}
            </div>
          </section>

          <section className="rounded-[20px] border border-[#F2E8DC] bg-white">
            <div className="flex flex-col gap-3 border-b border-[#F2E8DC] px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-[#1E1E1E]">Planning conges 12 mois</h2>
                <p className="mt-1 text-[12px] text-[#6B6B6B]">Cliquez sur une periode pour la supprimer.</p>
              </div>
              <div className="grid grid-cols-5 gap-2">
                <select value={leaveDraft.type} onChange={event => setLeaveDraft(prev => ({ ...prev, type: event.target.value as LeaveType }))} className="col-span-2 h-9 rounded-[10px] border border-[#F2E8DC] px-2 text-[12px] outline-none focus:border-[#F06B21]">
                  {Object.entries(leaveTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <select value={leaveDraft.month} onChange={event => setLeaveDraft(prev => ({ ...prev, month: event.target.value }))} className="col-span-3 h-9 rounded-[10px] border border-[#F2E8DC] px-2 text-[12px] outline-none focus:border-[#F06B21]">
                  {planningMonths.map(month => <option key={month} value={month}>{month}</option>)}
                </select>
                <input value={leaveDraft.startDay} onChange={event => setLeaveDraft(prev => ({ ...prev, startDay: Number(event.target.value) }))} type="number" min="1" max="31" className="h-9 rounded-[10px] border border-[#F2E8DC] px-2 text-[12px] outline-none focus:border-[#F06B21]" />
                <input value={leaveDraft.endDay} onChange={event => setLeaveDraft(prev => ({ ...prev, endDay: Number(event.target.value) }))} type="number" min="1" max="31" className="h-9 rounded-[10px] border border-[#F2E8DC] px-2 text-[12px] outline-none focus:border-[#F06B21]" />
                <input value={leaveDraft.note} onChange={event => setLeaveDraft(prev => ({ ...prev, note: event.target.value }))} placeholder="Note" className="col-span-2 h-9 rounded-[10px] border border-[#F2E8DC] px-2 text-[12px] outline-none focus:border-[#F06B21]" />
                <button type="button" onClick={addLeave} className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] bg-[#F06B21] px-3 text-[12px] font-semibold text-white transition hover:bg-[#D95B17]">
                  <Plus className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </div>
            <div className="grid gap-3 p-5 md:grid-cols-3 xl:grid-cols-4">
              {planningMonths.map(month => {
                const monthLeaves = memberLeaves.filter(leave => leave.month === month)
                return (
                  <div key={month} className="min-h-[112px] rounded-[14px] border border-[#F2E8DC] bg-[#FAF6F2] p-3">
                    <p className="text-[12px] font-semibold text-[#1E1E1E]">{month}</p>
                    <div className="mt-3 space-y-2">
                      {monthLeaves.length === 0 ? (
                        <p className="text-[11px] text-[#9CA3AF]">Disponible</p>
                      ) : (
                        monthLeaves.map(leave => (
                          <button key={leave.id} type="button" onClick={() => deleteLeave(leave.id)} className="flex w-full items-center justify-between gap-2 rounded-[8px] bg-white px-2 py-2 text-left text-[11px] text-[#3C3C3C] transition hover:bg-[#FEE2E2]">
                            <span>
                              <span className="block font-semibold text-[#1E1E1E]">{leaveTypeLabels[leave.type]}</span>
                              <span>{leave.startDay}-{leave.endDay} {leave.note ? `- ${leave.note}` : ''}</span>
                            </span>
                            <Trash2 className="h-3.5 w-3.5 shrink-0 text-[#DC2626]" strokeWidth={1.75} />
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, Icon }: { label: string; value: string; Icon: typeof HardHat }) {
  return (
    <section className="rounded-[20px] border border-[#F2E8DC] bg-white p-5">
      <Icon className="h-5 w-5 text-[#F06B21]" strokeWidth={1.75} />
      <p className="mt-4 text-[22px] font-semibold leading-none text-[#1E1E1E]">{value}</p>
      <p className="mt-2 text-[12px] font-medium text-[#6B6B6B]">{label}</p>
    </section>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-semibold text-[#1E1E1E]">{label}</p>
      <p className="mt-1 text-[#6B6B6B]">{value}</p>
    </div>
  )
}

function clampDay(day: number) {
  if (Number.isNaN(day)) return 1
  return Math.max(1, Math.min(31, day))
}
