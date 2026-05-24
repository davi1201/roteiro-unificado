import { describe, it } from 'vitest'

describe('useAutosave', () => {
  it.todo('SAVE-01: faz upsert com status draft após 1500ms de inatividade')
  it.todo('SAVE-02: cancela timer anterior ao receber nova mudança (debounce)')
  it.todo('UX-04: exibe toast "Salvo às HH:MM" após upsert com sucesso')
  it.todo('UX-04: exibe toast de warning quando upsert falha')
  it.todo('cleanup: cancela timer e faz unsubscribe ao desmontar')
})
