import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutosave } from './useAutosave'
import { createFormStore, TabKey } from '@/stores/formStore'

/**
 * Fábrica de mock do supabase para a cadeia fluente SELECT+UPDATE/INSERT.
 *
 * O hook useAutosave usa a seguinte estratégia (substituindo upsert — fix 42P10):
 *   1. supabase.from('assessments').select('id').eq(...).eq(...).maybeSingle()
 *   2a. Se draft existe: supabase.from('assessments').update({...}).eq('id', ...).eq('status', 'draft')
 *   2b. Se não existe:   supabase.from('assessments').insert({...})
 */

type MockOptions = {
  existingId?: string | null // null = sem draft existente, string = draft com esse id
  updateError?: Error | null
  insertError?: Error | null
}

function makeMockFrom({
  existingId = null,
  updateError = null,
  insertError = null,
}: MockOptions = {}) {
  const mockMaybeSingle = vi.fn().mockResolvedValue({
    data: existingId ? { id: existingId } : null,
    error: null,
  })
  const mockEqSelect2 = vi.fn(() => ({ maybeSingle: mockMaybeSingle }))
  const mockEqSelect1 = vi.fn(() => ({ eq: mockEqSelect2 }))
  const mockSelect = vi.fn(() => ({ eq: mockEqSelect1 }))

  const mockUpdate = vi.fn().mockResolvedValue({ error: updateError })
  const mockEqUpdate2 = vi.fn(() => mockUpdate)
  const mockEqUpdate1 = vi.fn(() => ({ eq: mockEqUpdate2 }))
  const mockUpdateFn = vi.fn(() => ({ eq: mockEqUpdate1 }))

  const mockInsert = vi.fn().mockResolvedValue({ error: insertError })

  const mockFrom = vi.fn((table: string) => {
    if (table !== 'assessments') return { select: vi.fn(), update: vi.fn(), insert: vi.fn() }
    // Retorna objeto com todos os métodos possíveis — o hook usa select, update ou insert
    return {
      select: mockSelect,
      update: mockUpdateFn,
      insert: mockInsert,
    }
  })

  return { mockFrom, mockSelect, mockMaybeSingle, mockUpdateFn, mockInsert }
}

// Mock do supabase — inicializado com mock padrão (sem draft existente)
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

// Mock do useToast para capturar chamadas de toast
const mockSuccess = vi.fn()
const mockWarning = vi.fn()
const mockError = vi.fn()
const mockInfo = vi.fn()
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    success: mockSuccess,
    warning: mockWarning,
    error: mockError,
    info: mockInfo,
    loading: vi.fn(),
    promise: vi.fn(),
    dismiss: vi.fn(),
  }),
}))

// Helpers para manipular timers falsos
beforeEach(() => {
  vi.useFakeTimers()
  mockSuccess.mockClear()
  mockWarning.mockClear()
  mockError.mockClear()
  mockInfo.mockClear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useAutosave', () => {
  it('SAVE-01: faz SELECT+INSERT quando não existe draft, com status draft após 1500ms', async () => {
    const { supabase } = await import('@/lib/supabase')
    const { mockFrom, mockInsert } = makeMockFrom({ existingId: null })
    vi.mocked(supabase.from).mockImplementation(mockFrom as never)

    const tenantId = `test-autosave-${Math.random().toString(36).slice(2)}`
    const store = createFormStore(tenantId)

    renderHook(() => useAutosave(tenantId))

    // Dispara mudança no sectionData
    act(() => {
      store.getState().updateSection(TabKey.Identificacao, { empresa: 'Acme' })
    })

    // Antes dos 1500ms, nenhuma chamada ao banco
    expect(mockInsert).not.toHaveBeenCalled()

    // Avança 1500ms e aguarda microtasks (Promises async)
    await act(async () => {
      vi.advanceTimersByTime(1500)
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
    })

    // Deve ter feito INSERT com org_id e status: 'draft'
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        org_id: tenantId,
        status: 'draft',
      })
    )
  })

  it('SAVE-01b: faz SELECT+UPDATE quando draft já existe', async () => {
    const { supabase } = await import('@/lib/supabase')
    const draftId = 'existing-draft-uuid'
    const { mockFrom, mockUpdateFn } = makeMockFrom({ existingId: draftId })
    vi.mocked(supabase.from).mockImplementation(mockFrom as never)

    const tenantId = `test-update-${Math.random().toString(36).slice(2)}`
    const store = createFormStore(tenantId)

    renderHook(() => useAutosave(tenantId))

    act(() => {
      store.getState().updateSection(TabKey.Identificacao, { empresa: 'Acme' })
    })

    await act(async () => {
      vi.advanceTimersByTime(1500)
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
    })

    // Deve ter feito UPDATE (não INSERT)
    expect(mockUpdateFn).toHaveBeenCalledWith(
      expect.objectContaining({
        form_data: expect.anything(),
      })
    )
  })

  it('SAVE-02: cancela timer anterior ao receber nova mudança (debounce)', async () => {
    const { supabase } = await import('@/lib/supabase')
    const { mockFrom, mockInsert } = makeMockFrom({ existingId: null })
    vi.mocked(supabase.from).mockImplementation(mockFrom as never)

    const tenantId = `test-debounce-${Math.random().toString(36).slice(2)}`
    const store = createFormStore(tenantId)

    renderHook(() => useAutosave(tenantId))

    // Primeira mudança
    act(() => {
      store.getState().updateSection(TabKey.Identificacao, { empresa: 'Acme' })
    })

    // Avança 1000ms (antes dos 1500ms)
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Segunda mudança — deve resetar o timer
    act(() => {
      store.getState().updateSection(TabKey.TorreDecisao, { nivelGerencial: 'g3' })
    })

    // Avança mais 1000ms (2000ms total, mas apenas 1000ms desde a segunda mudança)
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // INSERT ainda não deve ter sido chamado (debounce resetado)
    expect(mockInsert).not.toHaveBeenCalled()

    // Avança mais 500ms (1500ms desde a segunda mudança)
    await act(async () => {
      vi.advanceTimersByTime(500)
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
    })

    // Agora deve ter sido chamado apenas uma vez (INSERT ou seleção de update)
    // Como não há draft, deve ter chamado INSERT exatamente 1 vez
    expect(mockInsert).toHaveBeenCalledTimes(1)
  })

  it('UX-04: exibe toast "Salvo às HH:MM" após save com sucesso', async () => {
    const { supabase } = await import('@/lib/supabase')
    const { mockFrom } = makeMockFrom({ existingId: null, insertError: null })
    vi.mocked(supabase.from).mockImplementation(mockFrom as never)

    const tenantId = `test-toast-success-${Math.random().toString(36).slice(2)}`
    const store = createFormStore(tenantId)

    renderHook(() => useAutosave(tenantId))

    act(() => {
      store.getState().updateSection(TabKey.Identificacao, { empresa: 'Acme' })
    })

    await act(async () => {
      vi.advanceTimersByTime(1500)
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
    })

    // Deve chamar success com mensagem "Salvo às HH:MM"
    expect(mockSuccess).toHaveBeenCalledWith(expect.stringMatching(/^Salvo às \d{2}:\d{2}$/), {
      duration: 2000,
    })
  })

  it('UX-04: exibe toast de warning quando save falha', async () => {
    const { supabase } = await import('@/lib/supabase')
    const { mockFrom } = makeMockFrom({
      existingId: null,
      insertError: new Error('DB error'),
    })
    vi.mocked(supabase.from).mockImplementation(mockFrom as never)

    const tenantId = `test-toast-error-${Math.random().toString(36).slice(2)}`
    const store = createFormStore(tenantId)

    renderHook(() => useAutosave(tenantId))

    act(() => {
      store.getState().updateSection(TabKey.Identificacao, { empresa: 'Acme' })
    })

    await act(async () => {
      vi.advanceTimersByTime(1500)
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(mockWarning).toHaveBeenCalledWith('Falha ao salvar — tentando novamente')
    expect(mockSuccess).not.toHaveBeenCalled()
  })

  it('cleanup: cancela timer e faz unsubscribe ao desmontar', async () => {
    const { supabase } = await import('@/lib/supabase')
    const { mockFrom, mockInsert } = makeMockFrom({ existingId: null })
    vi.mocked(supabase.from).mockImplementation(mockFrom as never)

    const tenantId = `test-cleanup-${Math.random().toString(36).slice(2)}`
    const store = createFormStore(tenantId)

    const { unmount } = renderHook(() => useAutosave(tenantId))

    // Dispara mudança
    act(() => {
      store.getState().updateSection(TabKey.Identificacao, { empresa: 'Acme' })
    })

    // Desmonta antes dos 1500ms
    unmount()

    // Avança 1500ms — não deve chamar insert (timer foi cancelado no cleanup)
    await act(async () => {
      vi.advanceTimersByTime(1500)
      await Promise.resolve()
    })

    expect(mockInsert).not.toHaveBeenCalled()
  })
})

describe('useAutosave — lastSavedAt', () => {
  it('LAST-SAVED-01: após INSERT bem-sucedido, lastSavedAt é instância de Date', async () => {
    const { supabase } = await import('@/lib/supabase')
    const { mockFrom } = makeMockFrom({ existingId: null, insertError: null })
    vi.mocked(supabase.from).mockImplementation(mockFrom as never)

    const tenantId = `test-lastsaved-insert-${Math.random().toString(36).slice(2)}`
    const store = createFormStore(tenantId)

    renderHook(() => useAutosave(tenantId))

    act(() => {
      store.getState().updateSection(TabKey.Identificacao, { empresa: 'Acme' })
    })

    await act(async () => {
      vi.advanceTimersByTime(1500)
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(createFormStore(tenantId).getState().lastSavedAt).toBeInstanceOf(Date)
  })

  it('LAST-SAVED-02: após UPDATE bem-sucedido, lastSavedAt é instância de Date', async () => {
    const { supabase } = await import('@/lib/supabase')
    const draftId = 'existing-draft-uuid-lastsaved'
    const { mockFrom } = makeMockFrom({ existingId: draftId, updateError: null })
    vi.mocked(supabase.from).mockImplementation(mockFrom as never)

    const tenantId = `test-lastsaved-update-${Math.random().toString(36).slice(2)}`
    const store = createFormStore(tenantId)

    renderHook(() => useAutosave(tenantId))

    act(() => {
      store.getState().updateSection(TabKey.Identificacao, { empresa: 'Acme' })
    })

    await act(async () => {
      vi.advanceTimersByTime(1500)
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(createFormStore(tenantId).getState().lastSavedAt).toBeInstanceOf(Date)
  })

  it('LAST-SAVED-03: após save com erro, lastSavedAt permanece null', async () => {
    const { supabase } = await import('@/lib/supabase')
    const { mockFrom } = makeMockFrom({
      existingId: null,
      insertError: new Error('DB error'),
    })
    vi.mocked(supabase.from).mockImplementation(mockFrom as never)

    const tenantId = `test-lastsaved-error-${Math.random().toString(36).slice(2)}`
    const store = createFormStore(tenantId)

    renderHook(() => useAutosave(tenantId))

    act(() => {
      store.getState().updateSection(TabKey.Identificacao, { empresa: 'Acme' })
    })

    await act(async () => {
      vi.advanceTimersByTime(1500)
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(createFormStore(tenantId).getState().lastSavedAt).toBeNull()
  })
})
