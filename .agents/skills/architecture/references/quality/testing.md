# Padrões de Teste

## Ferramentas

- **Vitest** → test runner e assertions
- **React Testing Library** → testes de componentes e hooks
- **MSW** *(opcional)* → mocks de API em testes de integração
- **Testing Library User Event** → interações do usuário

---

# O que testar

| Camada | O que testar | Prioridade |
|---|---|---|
| `data/mapper` | Conversão Domain ⇄ DTO | Alta |
| `domain/services` | Regras de negócio e validações | Alta |
| `domain/validators` | Regras de validação | Alta |
| `shared/utils` | Funções puras | Alta |
| `presentation/hooks` | Integração com React Query | Média |
| `presentation/components` | Interações e renderização | Média |
| `data/api` | Apenas se houver lógica relevante além do client | Baixa |

---

# Testando Mappers

Mappers devem validar:

- DTO → Domain
- Domain → DTO
- parsing
- normalização
- transforms técnicos

```ts
import { describe, it, expect } from 'vitest'

import { OperatorMapper } from './operator-mapper'

import type { OperatorDTO } from '../dto/operator.dto'

describe('OperatorMapper', () => {
  it('converte DTO para domínio corretamente', () => {
    const dto: OperatorDTO = {
      id: '1',
      full_name: 'João Silva',
      status: 'active'
    }

    const model = OperatorMapper.toDomain(dto)

    expect(model.id).toBe('1')
    expect(model.name).toBe('João Silva')
    expect(model.isActive).toBe(true)
  })

  it('converte domínio para DTO corretamente', () => {
    const dto = OperatorMapper.toDTO({
      id: '1',
      name: 'João Silva',
      isActive: false
    })

    expect(dto.status).toBe('inactive')
  })
})
```

---

# Testando Services

Services devem ser testados quando possuem:

- validação
- regras de negócio
- decisões condicionais
- lançamento de erros

```ts
import { describe, expect, it, vi } from 'vitest'

import { OrderService } from './order-service'
import { OrderAPI } from '../../data/api/order-api'

vi.mock('../../data/api/order-api')

describe('OrderService', () => {
  it('deve impedir aprovação de pedido cancelado', async () => {
    await expect(
      OrderService.approve({
        id: '1',
        status: 'cancelled'
      })
    ).rejects.toThrow(
      'Pedido cancelado não pode ser aprovado.'
    )
  })
})
```

---

# Testando Validators

Validators devem ser testados como funções puras.

```ts
describe('OrderValidator', () => {
  it('deve lançar erro para pedido sem itens', () => {
    expect(() =>
      OrderValidator.validate({
        items: []
      })
    ).toThrow()
  })
})
```

---

# Testando Hooks

Hooks devem testar:

- integração com React Query
- invalidação de cache
- estados de loading
- estados de erro
- mutations

Sempre mockar:

- APIs
- services

Nunca mockar:

- `httpClient`

```ts
import { renderHook } from '@testing-library/react'
import { vi } from 'vitest'

import { useOperatorsQuery } from './use-queries'
import { OperatorAPI } from '../../data/api/operator-api'

vi.mock('../../data/api/operator-api')

describe('useOperatorsQuery', () => {
  it('deve retornar operadores', async () => {
    vi.mocked(OperatorAPI.getAll).mockResolvedValue([
      {
        id: '1',
        name: 'João'
      }
    ])

    const { result } = renderHook(() =>
      useOperatorsQuery()
    )

    expect(result.current).toBeDefined()
  })
})
```

---

# Testando Components

Testar:

- renderização condicional
- interação do usuário
- estados visuais
- acessibilidade básica

Sempre mockar os hooks da feature.

Nunca mockar `httpClient`.

```tsx
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { OperatorList } from './operator-list'
import * as hooks from '../hooks/use-queries'

describe('OperatorList', () => {
  it('exibe loading enquanto carrega', () => {
    vi.spyOn(hooks, 'useOperatorsQuery').mockReturnValue({
      data: undefined,
      isLoading: true
    } as any)

    render(<OperatorList />)

    expect(
      screen.getByText('Carregando...')
    ).toBeInTheDocument()
  })

  it('exibe lista de operadores', () => {
    vi.spyOn(hooks, 'useOperatorsQuery').mockReturnValue({
      data: [
        {
          id: '1',
          name: 'João'
        }
      ],
      isLoading: false
    } as any)

    render(<OperatorList />)

    expect(
      screen.getByText('João')
    ).toBeInTheDocument()
  })
})
```

---

# Estrutura dos testes

Arquivo de teste deve ficar próximo do arquivo testado.

```text
operator-list.tsx
operator-list.test.tsx
```

```text
operator-service.ts
operator-service.test.ts
```

```text
operator-mapper.ts
operator-mapper.test.ts
```

---

# Convenções

- Teste comportamento, não implementação
- Use mocks apenas no boundary necessário
- Evite mocks excessivos
- Não testar bibliotecas externas
- Nomeie testes com comportamento esperado

Exemplo:

```ts
'deve exibir erro quando login falhar'
```

---

# O que evitar testar

Evite testes de baixo valor:

- implementação interna de React Query
- bibliotecas externas
- getters/setters triviais
- componentes extremamente simples sem lógica

---

# Regra principal

Teste regras críticas primeiro:

1. regras de negócio
2. mapeamento de dados
3. validações
4. fluxos de UI

O objetivo é proteger o domínio e os fluxos críticos da aplicação.