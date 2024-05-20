# NextSAAS-RBAC

Este é um projeto SaaS (Software as a Service) construído com Next.js, focando em RBAC (Role-Based Access Control) e ABAC (Attribute-Based Access Control). O repositório contém o código-fonte tanto para o back-end quanto para o front-end.

## Tecnologias Utilizadas

### Back-end

- **Node.js**: Plataforma de desenvolvimento para construir aplicações server-side.
- **Fastify**: Framework web rápido e eficiente para Node.js.
- **Prisma**: ORM (Object-Relational Mapping) para interagir com o banco de dados.

### Front-end

- **Next.js 14**: Framework React para renderização do lado do servidor (SSR) e geração de páginas estáticas.
- **Server Components**: Componentes do lado do servidor que permitem renderização dinâmica no servidor.
- **Server Actions**: Ações executadas no servidor para melhorar a experiência do usuário.

## Estrutura do Monorepo

Este projeto utiliza um monorepo para manter o back-end e o front-end juntos. O TurboRepo é usado para otimizar processos e evitar execuções desnecessárias.


## Recursos

### Autenticação

- [ ] Deve ser capaz de autenticar usando e-mail e senha;
- [ ] Deve ser capaz de autenticar usando uma conta do Github;
- [ ] Deve ser capaz de recuperar a senha usando e-mail;
- [x] Deve ser capaz de criar uma conta (e-mail, nome e senha);

### Organizações

- [ ] Deve ser capaz de criar uma nova organização;
- [ ] Deve ser capaz de obter as organizações às quais o usuário pertence;
- [ ] Deve ser capaz de atualizar uma organização;
- [ ] Deve ser capaz de encerrar uma organização;
- [ ] Deve ser capaz de transferir a propriedade da organização;

### Convites

- [ ] Deve ser capaz de convidar um novo membro (e-mail, função);
- [ ] Deve ser capaz de aceitar um convite;
- [ ] Deve ser capaz de revogar um convite pendente;

### Membros

- [ ] Deve ser capaz de obter os membros da organização;
- [ ] Deve ser capaz de atualizar a função de um membro;

### Projetos

- [ ] Deve ser capaz de obter projetos dentro de uma organização;
- [ ] Deve ser capaz de criar um novo projeto (nome, URL, descrição);
- [ ] Deve ser capaz de atualizar um projeto (nome, URL, descrição);
- [ ] Deve ser capaz de excluir um projeto;

### Cobrança

- [ ] Deve ser capaz de obter detalhes de cobrança para a organização ($20 por projeto / $10 por membro excluindo a função de cobrança);

## RBAC

Funções e permissões.

### Funções

- Administrador (Proprietário da organização)
- Membro
- Cobrança (um por organização)
- Anônimo

### Tabela de permissões

| Recurso | Administrador | Membro | Faturamento | Anônimo |
| --- | --- | --- | --- | --- |
| Atualizar Organização | ✅ | ❌ | ❌ | ❌ |
| Excluir Organização | ✅ | ❌ | ❌ | ❌ |
| Convidar um Membro | ✅ | ❌ | ❌ | ❌ |
| Revogar um Convite | ✅ | ❌ | ❌ | ❌ |
| Listar Membros | ✅ | ✅ | ✅ | ❌ |
| Transferir Propriedade | ⚠️  | ❌ | ❌ | ❌ |
| Atualizar Função de Membro | ✅ | ❌ | ❌ | ❌ |
| Excluir Membro | ✅  | ⚠️ | ❌ | ❌ |
| Listar Projetos | ✅ | ✅ | ✅ | ❌ |
| Criar um Novo Projeto | ✅ | ✅ | ❌ | ❌ |
| Atualizar um Projeto | ✅  | ⚠️ | ❌ | ❌ |
| Excluir um Projeto | ✅ | ⚠️ | ❌ | ❌ |
| Obter Detalhes de Faturamento | ✅ | ❌ | ✅ | ❌ |
| Exportar Detalhes de Faturamento | ✅ | ❌ | ✅ | ❌ |

> ✅ = permitido
> ❌ = não permitido
> ⚠️ = permitido com condições

#### Condições

- Administradores podem transferir a propriedade da organização;
- Membros podem sair de sua própria organização;
- Somente administradores e autores de projetos podem atualizar/excluir o projeto;


## Configuração

1. Clone este repositório.
2. Instale as dependências: