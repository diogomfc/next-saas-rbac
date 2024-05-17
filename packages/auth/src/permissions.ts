import { AbilityBuilder } from '@casl/ability'

import { AppAbility } from '.'
import { User } from './models/user'
import { Role } from './roles'

type PermissionByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void

export const permissions: Record<Role, PermissionByRole> = {
  ADMIN: (_, builder) => {
    const { can } = builder
    can('manage', 'all')
  },
  USER: () => {},
  GUEST: () => {},
  BILLING: () => {},
  MEMBER: (user, { can }) => {
    // can('invite', 'User')
    can(['create', 'get'], 'Project')
    can(['update', 'delete'], 'Project', { ownerId: { $eq: user.id } })
  },
}
