import { createElement, type ReactNode } from 'react'
import { renderHook } from '@testing-library/react'
import { useForm, FormProvider } from 'react-hook-form'
import { TabKey, clearFormStore, createFormStore } from '@/stores/formStore'
import { useFormSection } from './useFormSection'

// Use a unique tenantId per test run to avoid store cross-contamination
let tenantId: string

beforeEach(() => {
  tenantId = `test-useformsection-${Math.random().toString(36).slice(2)}`
})

afterEach(() => {
  clearFormStore(tenantId)
})

/**
 * Wrapper that provides a FormProvider context so useFormState (called
 * inside useFormSection) has a valid RHF context even in the "without control"
 * path (where control is passed as undefined).
 */
function WithFormProvider({ children }: { children: ReactNode }) {
  const methods = useForm()
  return createElement(FormProvider, { ...methods }, children)
}

describe('useFormSection without control (Phase 5 compat)', () => {
  it('returns 0.01 sentinel completeness when tab has been visited', () => {
    createFormStore(tenantId).getState().markTabVisited(TabKey.Identificacao)

    const { result } = renderHook(() => useFormSection(tenantId, TabKey.Identificacao), {
      wrapper: WithFormProvider,
    })
    expect(result.current.completeness).toBe(0.01)
  })

  it('returns 0 completeness when tab has NOT been visited', () => {
    const { result } = renderHook(() => useFormSection(tenantId, TabKey.Identificacao), {
      wrapper: WithFormProvider,
    })
    expect(result.current.completeness).toBe(0)
  })

  it('returns empty errors object when no control provided', () => {
    const { result } = renderHook(() => useFormSection(tenantId, TabKey.Identificacao), {
      wrapper: WithFormProvider,
    })
    expect(result.current.errors).toEqual({})
  })
})

describe('useFormSection with control (Phase 6 real completeness)', () => {
  it('returns non-sentinel completeness (not 0.01) when control is provided', () => {
    const { result } = renderHook(() => {
      const { control } = useForm()
      return useFormSection(tenantId, TabKey.Identificacao, control, 2)
    })
    // With control provided, completeness should be calculated from formState
    // — NOT the 0.01 Phase 5 sentinel
    expect(result.current.completeness).not.toBe(0.01)
    expect(typeof result.current.completeness).toBe('number')
  })

  it('returns errors as flattened Record<string, string> (empty when no validation errors)', () => {
    const { result } = renderHook(() => {
      const { control } = useForm()
      return useFormSection(tenantId, TabKey.Identificacao, control, 2)
    })
    expect(result.current.errors).toEqual({})
  })

  it('returns completeness 1 when totalRequired=2 and no validation errors', () => {
    const { result } = renderHook(() => {
      const { control } = useForm()
      return useFormSection(tenantId, TabKey.Identificacao, control, 2)
    })
    // 0 errors + totalRequired=2 → filled=max(0,2-0)=2, completeness=2/2=1
    expect(result.current.completeness).toBe(1)
  })
})
