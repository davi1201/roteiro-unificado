import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutosave } from './useAutosave'
import { createFormStore, TabKey } from '@/stores/formStore'

// Mock do supabase — não queremos chamadas de rede reais
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}))

// Mock do useToast para capturar chamadas de toast
const mockSuccess = vi.fn()
const mockWarning = vi.fn()
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ success: mockSuccess, warning: mockWarning }),
}))

// Helpers para manipular timers falsos
beforeEach(() => {
  vi.useFakeTimers()
  mockSuccess.mockClear()
  mockWarning.mockClear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useAutosave', () => {
  it('SAVE-01: faz upsert com status draft após 1500ms de inatividade', async () => {
    const { supabase } = await import('@/lib/supabase')
    const mockUpsert = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(supabase.from).mockReturnValue({ upsert: mockUpsert } as never)

    const tenantId = `test-autosave-${Math.random().toString(36).slice(2)}`
    const store = createFormStore(tenantId)

    renderHook(() => useAutosave(tenantId))

    // Dispara mudança no sectionData
    act(() => {
      store.getState().updateSection(TabKey.Identificacao, { empresa: 'Acme' })
    })

    // Antes dos 1500ms, upsert não deve ter sido chamado
    expect(mockUpsert).not.toHaveBeenCalled()

    // Avança 1500ms
    await act(async () => {
      vi.advanceTimersByTime(1500)
      // Aguarda microtasks (a Promise do upsert async)
      await Promise.resolve()
    })

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        org_id: tenantId,
        status: 'draft',
      }),
      { onConflict: 'org_id,status' }
    )
  })

  it('SAVE-02: cancela timer anterior ao receber nova mudança (debounce)', async () => {
    const { supabase } = await import('@/lib/supabase')
    const mockUpsert = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(supabase.from).mockReturnValue({ upsert: mockUpsert } as never)

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

    // Upsert ainda não deve ter sido chamado (debounce resetado)
    expect(mockUpsert).not.toHaveBeenCalled()

    // Avança mais 500ms (1500ms desde a segunda mudança)
    await act(async () => {
      vi.advanceTimersByTime(500)
      await Promise.resolve()
    })

    // Agora deve ter sido chamado apenas uma vez
    expect(mockUpsert).toHaveBeenCalledTimes(1)
  })

  it('UX-04: exibe toast "Salvo às HH:MM" após upsert com sucesso', async () => {
    const { supabase } = await import('@/lib/supabase')
    const mockUpsert = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(supabase.from).mockReturnValue({ upsert: mockUpsert } as never)

    const tenantId = `test-toast-success-${Math.random().toString(36).slice(2)}`
    const store = createFormStore(tenantId)

    renderHook(() => useAutosave(tenantId))

    act(() => {
      store.getState().updateSection(TabKey.Identificacao, { empresa: 'Acme' })
    })

    await act(async () => {
      vi.advanceTimersByTime(1500)
      await Promise.resolve()
    })

    // Deve chamar success com mensagem "Salvo às HH:MM"
    expect(mockSuccess).toHaveBeenCalledWith(expect.stringMatching(/^Salvo às \d{2}:\d{2}$/), {
      duration: 2000,
    })
  })

  it('UX-04: exibe toast de warning quando upsert falha', async () => {
    const { supabase } = await import('@/lib/supabase')
    const mockUpsert = vi.fn().mockResolvedValue({ error: new Error('DB error') })
    vi.mocked(supabase.from).mockReturnValue({ upsert: mockUpsert } as never)

    const tenantId = `test-toast-error-${Math.random().toString(36).slice(2)}`
    const store = createFormStore(tenantId)

    renderHook(() => useAutosave(tenantId))

    act(() => {
      store.getState().updateSection(TabKey.Identificacao, { empresa: 'Acme' })
    })

    await act(async () => {
      vi.advanceTimersByTime(1500)
      await Promise.resolve()
    })

    expect(mockWarning).toHaveBeenCalledWith('Falha ao salvar — tentando novamente')
    expect(mockSuccess).not.toHaveBeenCalled()
  })

  it('cleanup: cancela timer e faz unsubscribe ao desmontar', async () => {
    const { supabase } = await import('@/lib/supabase')
    const mockUpsert = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(supabase.from).mockReturnValue({ upsert: mockUpsert } as never)

    const tenantId = `test-cleanup-${Math.random().toString(36).slice(2)}`
    const store = createFormStore(tenantId)

    const { unmount } = renderHook(() => useAutosave(tenantId))

    // Dispara mudança
    act(() => {
      store.getState().updateSection(TabKey.Identificacao, { empresa: 'Acme' })
    })

    // Desmonta antes dos 1500ms
    unmount()

    // Avança 1500ms — não deve chamar upsert (timer foi cancelado no cleanup)
    await act(async () => {
      vi.advanceTimersByTime(1500)
      await Promise.resolve()
    })

    expect(mockUpsert).not.toHaveBeenCalled()
  })
})
