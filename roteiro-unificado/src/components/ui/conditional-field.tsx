import { useEffect, type ReactNode } from 'react'

interface ConditionalFieldProps {
  condition: boolean
  fieldName: string
  unregisterFn: (name: string, options?: { keepValue?: boolean }) => void
  children: ReactNode
}

export function ConditionalField({
  condition,
  fieldName,
  unregisterFn,
  children,
}: ConditionalFieldProps) {
  useEffect(() => {
    if (!condition) {
      unregisterFn(fieldName, { keepValue: false })
    }
  }, [condition, fieldName, unregisterFn])

  if (!condition) return null
  return <>{children}</>
}
