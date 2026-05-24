import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'sidebar_collapsed'

/**
 * Hook de estado colapsado da sidebar admin.
 *
 * Persiste o estado em localStorage com a chave `sidebar_collapsed`.
 * Inclui try/catch para proteção contra SSR e localStorage quota excedido
 * (ex: Safari private mode) — STRIDE T-09.5-02.
 *
 * @returns [collapsed, toggleCollapsed] — tupla análoga a useState
 */
export function useSidebarCollapsed(): [boolean, () => void] {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed))
    } catch {
      // quota excedido ou Safari private mode — não quebra a UI
    }
  }, [collapsed])

  const toggle = useCallback(() => setCollapsed((c) => !c), [])

  return [collapsed, toggle]
}
