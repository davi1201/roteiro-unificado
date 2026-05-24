import { describe, it } from 'vitest'

describe('useNewRevision', () => {
  it.todo('SAVE-04: não sobrescreve registros submitted — usa INSERT')
  it.todo('SAVE-05: copia form_data da versão submitted mais recente')
  it.todo('SAVE-05: incrementa version no INSERT (latest.version + 1)')
  it.todo('navega para /form/:orgId após sucesso')
  it.todo('exibe toast de erro em caso de falha no INSERT')
})
