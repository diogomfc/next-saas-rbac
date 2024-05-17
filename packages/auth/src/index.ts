import {
  AbilityBuilder,
  CreateAbility,
  createMongoAbility,
  MongoAbility,
} from '@casl/ability'
import { z } from 'zod'

import { User } from './models/user'
import { permissions } from './permissions'
import { billingSchemaSubject } from './subjects/billing'
import { inviteSchemaSubject } from './subjects/invite'
import { organizationSchemaSubject } from './subjects/organization'
import { projectSchemaSubject } from './subjects/project'
import { userSchemaSubject } from './subjects/user'

export const appAbilitiesSchema = z.union([
  userSchemaSubject,
  projectSchemaSubject,
  organizationSchemaSubject,
  inviteSchemaSubject,
  billingSchemaSubject,
  z.tuple([z.literal('manage'), z.literal('all')]),
])

type AppAbilities = z.infer<typeof appAbilitiesSchema>

export type AppAbility = MongoAbility<AppAbilities>
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>

export function defineAbilitiesFor(user: User) {
  const builder = new AbilityBuilder(createAppAbility)

  if (typeof permissions[user.role] !== 'function') {
    throw new Error(`Undefined permissions for user ${user} in ${user.role}`)
  }
  permissions[user.role](user, builder)

  const ability = builder.build({
    detectSubjectType(subject) {
      return subject.__typename
    },
  })

  return ability
}
