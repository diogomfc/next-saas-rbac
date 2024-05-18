import {
  defineAbilitiesFor,
  organizationSchema,
  projectSchema,
  userSchema,
} from '@saas/auth'

const ability = defineAbilitiesFor({
  role: 'MEMBER',
  id: 'userId',
})

const user = userSchema.parse({
  id: 'userId',
  role: 'ADMIN',
})

const project = projectSchema.parse({
  id: 'projectId',
  ownerId: 'userId-2',
})

const organization = organizationSchema.parse({
  id: 'organizationId',
  ownerId: 'userId-2',
})
console.log(`Permissão de : ${user.role} User com id: ${user.id}`)

// User poderá gerenciar tudo
const userCanManageAll = ability.can('manage', 'all')
console.log(`User poderá gerenciar tudo? ${userCanManageAll}`)

// User poderá transferir a propriedade da organização se for o dono
const userCanTransferOwnershipOrUpdateOrganizationIfOwner = ability.can(
  'transfer_ownership',
  organization,
)
console.log(
  `User poderá transferir a propriedade da organização se for o dono? ${userCanTransferOwnershipOrUpdateOrganizationIfOwner}`,
)

// User não poderá transferir atualizar a organização se for o dono
const userCanUpdateOrganization = ability.can('update', organization)
console.log(
  `User poderá atualizar a organização se for o dono? ${userCanUpdateOrganization}`,
)

// User poderá ver usuários
const userCanGetUser = ability.can('get', 'User')
console.log(`User poderá ver usuários? ${userCanGetUser}`)

// User poderá criar projetos
const userCanCreateProject = ability.can('create', 'Project')
console.log(`User poderá criar projetos? ${userCanCreateProject}`)

// User poderá ver projetos
const userCanGetProject = ability.can('get', 'Project')
console.log(`User poderá ver projetos? ${userCanGetProject}`)

// User poderá deletar projetos se for o dono
const userCanUpdateProjectIfOwner = ability.can('update', project)
console.log(
  `User poderá atualizar projetos se for o dono? ${userCanUpdateProjectIfOwner}`,
)
// User poderá atualizar projetos se for o dono
const userCanDeleteProjectIfOwner = ability.can('delete', project)
console.log(
  `User poderá deletar projetos se for o dono? ${userCanDeleteProjectIfOwner}`,
)

// User poderá gerenciar faturamento
const userCanManageBilling = ability.can('manage', 'Billing')
console.log(`User poderá gerenciar faturamento? ${userCanManageBilling}`)
