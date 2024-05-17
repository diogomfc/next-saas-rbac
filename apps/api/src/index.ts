import { defineAbilitiesFor } from '@saas/auth'

const ability = defineAbilitiesFor({
  role: 'ADMIN',
})

// User poderá convidar alguém
const userCanInviteSomeoneElse = ability.can('invite', 'User')

// User poderá deletar outro User
const userCanDeleteOtherUsers = ability.can('delete', 'User')

// User não poderá deletar outro User
const userCannotDeleteOtherUsers = ability.cannot('delete', 'User')

console.log(
  `User tem a permissão de ${ability.rules[0].action} poderá convidar alguém? ${userCanInviteSomeoneElse}`,
)
console.log(`User poderá deletar outro User? ${userCanDeleteOtherUsers}`)
console.log(`User não poderá deletar outro User? ${userCannotDeleteOtherUsers}`)
