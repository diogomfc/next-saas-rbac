import { AbilityBuilder } from '@casl/ability'

import { AppAbility } from '.'
import { User } from './models/user'
import { Role } from './roles'

type PermissionByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void

export const permissions: Record<Role, PermissionByRole> = {
  // ADMIN pode gerenciar tudo
  // ADMIN não pode transferir a propriedade ou atualizar a organização
  // ADMIN pode transferir a propriedade ou atualizar a organização se for o dono
  ADMIN(user, { can, cannot }) {
    can('manage', 'all')
    cannot(['transfer_ownership', 'update'], 'Organization')
    can(['transfer_ownership', 'update'], 'Organization', {
      ownerId: { $eq: user.id },
    })
  },

  // MEMBER pode ver usuários
  // MEMBER pode ver e criar projetos
  // MEMBER pode atualizar e deletar projetos se for o dono
  MEMBER(user, { can }) {
    can('get', 'User')
    can(['create', 'get'], 'Project')
    can(['update', 'delete'], 'Project', { ownerId: { $eq: user.id } })
  },

  // BILLING pode gerenciar faturamento
  BILLING(_, { can }) {
    can('manage', 'Billing')
  },
}
