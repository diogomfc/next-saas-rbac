import { defineAbilitiesFor, Role, userSchema } from '@saas/auth'

export function getUserPermissions(userId: string, role: Role) {
  // valida se o usuário autenticado tem permissão para atualizar a organização
  const authUser = userSchema.parse({
    id: userId,
    role,
  })

  // define as permissões do usuário autenticado
  const ability = defineAbilitiesFor(authUser)

  return ability
}
