# Condly API

Gerenciamento de condomínio e apartamentos com integração com o sistema de portaria Condly.

**Stack:** Nest.js 12 · Prisma 7 (MySQL) · JWT · Swagger · Firebase Cloud Messaging · Docker

## Arquitetura (Clean Architecture + DDD)

```
src/
├── shared/                  # Shared kernel
│   ├── domain/              # Entity base, erros de domínio, Role, paginação
│   ├── application/         # Actor (usuário autenticado), helpers de paginação
│   └── infrastructure/      # Prisma, Firebase, filtro de erros, decorators HTTP
└── modules/                 # Bounded contexts
    ├── condominium/         # Condomínios e apartamentos
    ├── identity/            # Usuários e autenticação
    └── portaria/            # Eventos da portaria e integração Condly
        ├── domain/          # Entidades, value objects, regras e contratos de repositório
        ├── application/     # Casos de uso e portas (interfaces) para a infraestrutura
        ├── infrastructure/  # Adapters: repositórios Prisma, Firebase, JWT, bcrypt
        └── presentation/    # Controllers, DTOs (validação/Swagger) e presenters
```

- A dependência aponta sempre para dentro: `presentation → application → domain`. A `infrastructure` implementa os contratos (classes abstratas) do domínio/aplicação e é ligada no módulo Nest.
- Regras de negócio ficam nas entidades e value objects (ex.: `PortariaEvent.respond()`, `Cnpj`, `User` exige apartamento para moradores).
- Erros de domínio (`NotFoundError`, `ForbiddenError`...) são convertidos em HTTP pelo `DomainErrorFilter`.
- Testes unitários usam repositórios em memória (`test/repositories`) e não precisam de banco.

## Como rodar

```bash
cp .env.example .env
docker compose up -d --build      # MySQL + API (aplica as migrations)
docker compose exec api npx prisma db seed   # cria o usuário admin
```

Ou localmente (com o MySQL do compose):

```bash
yarn install
docker compose up -d mysql
yarn prisma:deploy && yarn prisma:seed
yarn start:dev
```

- Swagger: http://localhost:3000/docs
- Health: http://localhost:3000/health
- Admin padrão: `admin@condly.com` / `admin123` (altere em `ADMIN_EMAIL`/`ADMIN_PASSWORD`)

## Perfis

| Perfil   | Acesso |
|----------|--------|
| ADMIN    | Tudo; cadastra condomínios e síndicos |
| SINDICO  | Apartamentos e usuários (porteiros/moradores) do próprio condomínio |
| PORTEIRO | Consulta moradores/eventos do condomínio e finaliza eventos |
| MORADOR  | Vê o próprio apartamento e autoriza/nega visitantes |

## Integração com a portaria Condly

Endpoints em `/api/integrations/condly`, autenticados pelo header `x-api-key` (`CONDLY_PORTARIA_API_KEY`).
O condomínio é identificado pelo campo `condlyPortariaId`.

1. `GET  /condominiums/:condlyPortariaId/apartments` — sincroniza apartamentos e moradores.
2. `POST /events` — registra visitante, encomenda ou prestador; os moradores recebem push via Firebase.
   Envie `externalId` para tornar o registro idempotente.
3. O morador responde pelo app em `PATCH /api/portaria-events/:id/respond` (`AUTORIZADO`/`NEGADO`).
4. `GET  /events/:id` — a portaria consulta o status (aceita `id` ou `externalId`).
5. `PATCH /events/:id/finalize` — marca a entrada/entrega como concluída.

O app do morador registra o token de push em `PATCH /api/users/me/fcm-token`.

## Firebase

Preencha `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` e `FIREBASE_PRIVATE_KEY` com os dados da
service account. Sem essas variáveis a API funciona normalmente, apenas sem notificações push.

## Scripts úteis

| Script | Descrição |
|--------|-----------|
| `yarn prisma:migrate` | Cria/aplica migrations em desenvolvimento |
| `yarn prisma:deploy`  | Aplica migrations (produção) |
| `yarn prisma:seed`    | Cria o usuário admin |
| `yarn prisma:studio`  | Abre o Prisma Studio |
