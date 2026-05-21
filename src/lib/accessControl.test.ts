import { describe, expect, it } from 'vitest'
import {
  canAccessPage,
  defaultAccessMatrix,
  normalizeAccessMatrix,
  getDefaultPathForRole,
  type AccessMatrix,
} from '@/lib/accessControl'

describe('access control matrix', () => {
  it('does not let local overrides grant capabilities beyond role defaults', () => {
    const maliciousMatrix: AccessMatrix = {
      ...defaultAccessMatrix,
      chef_chantier: {
        ...defaultAccessMatrix.chef_chantier,
        previsionnel: {
          view: true,
          create: true,
          edit: true,
          admin: true,
        },
        parametres: {
          view: true,
          create: true,
          edit: true,
          admin: true,
        },
      },
    }

    const normalized = normalizeAccessMatrix(maliciousMatrix)

    expect(canAccessPage('chef_chantier', 'previsionnel', normalized)).toBe(false)
    expect(canAccessPage('chef_chantier', 'parametres', normalized, 'admin')).toBe(false)
  })

  it('keeps local overrides able to restrict visible UI capabilities', () => {
    const restrictedMatrix: AccessMatrix = {
      ...defaultAccessMatrix,
      assistante: {
        ...defaultAccessMatrix.assistante,
        factures: {
          view: false,
          create: false,
          edit: false,
          admin: false,
        },
      },
    }

    const normalized = normalizeAccessMatrix(restrictedMatrix)

    expect(canAccessPage('assistante', 'factures', defaultAccessMatrix)).toBe(true)
    expect(canAccessPage('assistante', 'factures', normalized)).toBe(false)
  })

  it('keeps chantier profiles constrained to COWORK by default', () => {
    expect(canAccessPage('chef_chantier', 'cowork', defaultAccessMatrix)).toBe(true)
    expect(canAccessPage('chef_chantier', 'dashboard', defaultAccessMatrix)).toBe(false)
    expect(canAccessPage('chef_chantier', 'chantiers', defaultAccessMatrix)).toBe(false)
    expect(canAccessPage('chef_chantier', 'equipe', defaultAccessMatrix)).toBe(false)
    expect(getDefaultPathForRole('chef_chantier', defaultAccessMatrix)).toBe('/cowork')

    expect(canAccessPage('ouvrier', 'cowork', defaultAccessMatrix)).toBe(true)
    expect(canAccessPage('ouvrier', 'dashboard', defaultAccessMatrix)).toBe(false)
    expect(canAccessPage('ouvrier', 'equipe', defaultAccessMatrix)).toBe(false)
    expect(getDefaultPathForRole('ouvrier', defaultAccessMatrix)).toBe('/cowork')
  })
})
