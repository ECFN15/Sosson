import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, ChevronDown } from 'lucide-react'
import { login } from '@/lib/auth'
import { useApp } from '@/lib/store'
import { users, roleLabels } from '@/data/users'

export function LoginPage() {
  const { setUser } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showDemo, setShowDemo] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const user = await login(email, password)
    if (user) {
      setUser(user)
      navigate('/dashboard')
    } else {
      setError('Email ou mot de passe incorrect')
    }
  }

  async function loginAs(userEmail: string) {
    const user = await login(userEmail, 'demo')
    if (user) {
      setUser(user)
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4 shadow-lg">
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Sosson</h1>
          <p className="text-slate-400 text-sm">Hub opérationnel chantiers</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.fr"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                required
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Se connecter
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm w-full justify-center transition-colors"
            >
              <ChevronDown
                size={16}
                className={`transition-transform ${showDemo ? 'rotate-180' : ''}`}
              />
              Connexion rapide démo
            </button>

            {showDemo && (
              <div className="mt-4 space-y-2">
                {users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => loginAs(u.email)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-700">
                      {u.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-800">
                        {u.prenom} {u.nom}
                      </div>
                      <div className="text-xs text-slate-500">{roleLabels[u.role]}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Mode démonstration — données fictives
        </p>
      </div>
    </div>
  )
}
