import { renderHook, act } from '@testing-library/react'
import { useSidebarCollapsed } from './useSidebarCollapsed'

describe('useSidebarCollapsed', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('Test 1: retorna [false, fn] quando localStorage está vazio (default expandido)', () => {
    const { result } = renderHook(() => useSidebarCollapsed())
    const [collapsed, toggle] = result.current
    expect(collapsed).toBe(false)
    expect(typeof toggle).toBe('function')
  })

  it('Test 2: retorna [true, fn] quando localStorage tem sidebar_collapsed = "true"', () => {
    localStorage.setItem('sidebar_collapsed', 'true')
    const { result } = renderHook(() => useSidebarCollapsed())
    const [collapsed] = result.current
    expect(collapsed).toBe(true)
  })

  it('Test 3: chamar toggle inverte o estado e escreve em localStorage ("false" → "true")', () => {
    const { result } = renderHook(() => useSidebarCollapsed())
    act(() => {
      result.current[1]()
    })
    expect(result.current[0]).toBe(true)
    expect(localStorage.getItem('sidebar_collapsed')).toBe('true')
  })

  it('Test 4: chamar toggle duas vezes volta ao estado original', () => {
    const { result } = renderHook(() => useSidebarCollapsed())
    act(() => {
      result.current[1]()
    })
    act(() => {
      result.current[1]()
    })
    expect(result.current[0]).toBe(false)
    expect(localStorage.getItem('sidebar_collapsed')).toBe('false')
  })
})
