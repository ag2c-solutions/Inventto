# Mappers — Conversão DTO ⇄ Domain

## Por que mappers existem

A UI nunca consome DTOs diretamente.

O mapper isola a aplicação de mudanças externas.

```text
API muda um campo?
→ só o mapper precisa mudar

UI muda um campo?
→ só o mapper precisa mudar
```

O domínio continua protegido de mudanças no backend.

---

## Por que o mapper vive em `data/`, e não em `domain/`

Historicamente o mapper vivia em `domain/`, quando ainda não existia a camada
`data/`. A camada `data/` foi criada justamente para atuar como a **ACL
(Anti-Corruption Layer)** da feature — a porta de entrada do mundo externo
(backend, integrações de terceiros) para dentro da feature.

Por isso o mapper pode referenciar tipos de `infra/` — ele é, como parte da
ACL, exatamente o lugar cuja função é conhecer o formato de dados externos
para traduzi-los. Quem precisa ficar isolado de `infra/` é `domain/`, não
`data/`.

---

# Onde vivem

Mappers vivem em:

```text
features/<feature>/data/mappers/
```

Exemplo:

```text
features/operators/data/mappers/index.ts
```

---

# Estrutura — Classe com métodos estáticos

Mappers são classes com métodos estáticos.

Nunca devem ser instanciados.

```ts
import type { OperatorDTO } from '../dtos'
import type { Operator } from '../../domain/entities'

export class OperatorMapper {
  // DTO → Domain
  static toDomain(
    dto: OperatorDTO
  ): Operator {
    return {
      id: dto.id,
      name: dto.full_name,
      isActive:
        dto.status === 'active',
      createdAt: new Date(
        dto.created_at
      )
    }
  }

  // Domain → DTO
  static toDTO(
    model: Operator
  ): OperatorDTO {
    return {
      id: model.id,
      full_name: model.name,
      status: model.isActive
        ? 'active'
        : 'inactive',
      created_at:
        model.createdAt.toISOString()
    }
  }
}
```

---

# Mapeamento de listas

Métodos de lista continuam na mesma classe.

```ts
export class OperatorMapper {
  static toDomain(
    dto: OperatorDTO
  ): Operator {
    ...
  }

  static toDomainList(
    dtos: OperatorDTO[]
  ): Operator[] {
    return dtos.map(
      OperatorMapper.toDomain
    )
  }
}
```

---

# Uso na API

Hoje o mapper é consumido pela camada `data/api`.

```ts
export class OperatorAPI {
  static async getAll() {
    const { data } = await supabase
      .from('operators')
      .select()
      .overrideTypes<Array<OperatorDTO>, { merge: false }>()

    return OperatorMapper.toDomainList(data)
  }
}
```

---

# Mapeamento com múltiplos DTOs

Quando houver agregação de múltiplas fontes:

```ts
export class OperatorMapper {
  static toGroupList(
    teams: TeamDTO[],
    allUsers: UserDTO[]
  ): OperatorGroup[] {
    return teams.map((team) => {
      const members =
        team.members.map((tm) => {
          const fullUser =
            allUsers.find(
              (u) =>
                u.id ===
                tm.member.id
            )

          return {
            id: tm.member.id,
            name: fullUser
              ? `${fullUser.firstName ?? ''} ${fullUser.lastName ?? ''}`.trim()
              : tm.member.name,
            email:
              fullUser?.email ??
              tm.member.username,
            phone:
              fullUser
                ?.attributes
                ?.phone?.[0],
            isLeader:
              tm.isTeamLead
          }
        })

      const leader =
        members.find(
          (m) => m.isLeader
        )

      return {
        id: team.groupId,
        name: team.groupName,
        membersCount:
          members.length,
        leaderName:
          leader?.name,
        members
      }
    })
  }
}
```

---

# Transformações permitidas

Mappers podem:

- renomear campos
- converter tipos
- normalizar dados
- aplicar fallback técnico
- combinar múltiplos DTOs
- remover campos desnecessários

---

# Fallback seguro

Campos opcionais devem usar fallback seguro.

```ts
static toDomain(
  dto: OperatorDTO
): Operator {
  return {
    id: dto.id,
    description:
      dto.description ?? '',
    tags: dto.tags ?? []
  }
}
```

---

# O mapper NÃO pode fazer

❌ chamadas HTTP

❌ usar React

❌ usar React Query

❌ acessar store

❌ usar hooks

❌ acessar components

❌ fazer regra de negócio

---

## Exemplo errado

```ts
static toDomain(dto: ProductDTO) {
  if (dto.role === 'admin') {
    throw new Error(
      'Admin não permitido'
    )
  }
}
```

Regra de negócio pertence ao:

```text
domain/services
domain/validators
```

---

# O mapper NÃO pode importar

❌ `presentation`

❌ `hooks`

❌ `components`

❌ `stores`

❌ `domain/services`

---

## Tipos de DTOs externos (`infra/`)

O mapper pode importar o **tipo** de um DTO de uma integração externa quando
precisa combinar esse formato com o DTO da própria feature — é exatamente o
caso de "Mapeamento com múltiplos DTOs":

```ts
import type { ViaCEPResponseDTO } from '@/infra/viacep'
```

Isso não é uma dependência de `infra/`: nenhum código de `infra/` é executado
pelo mapper, só o formato do dado é referenciado em tempo de compilação. É
justamente o papel da ACL.

---

# Regra principal

Mapper traduz contratos externos para o formato ideal do domínio.

Ele protege a aplicação contra mudanças externas.