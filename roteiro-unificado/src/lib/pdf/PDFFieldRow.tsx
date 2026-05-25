/**
 * PDFFieldRow — Linha de campo label/valor para o chunk PDF.
 * Usa apenas primitivos de @react-pdf/renderer — sem hooks, sem Tailwind.
 * D-03: valores vazios (undefined/null/'') exibem '—' em cinza (textEmpty).
 */
import { View, Text } from '@react-pdf/renderer'
import { styles } from './styles'

interface PDFFieldRowProps {
  label: string
  value: unknown
}

export function PDFFieldRow({ label, value }: PDFFieldRowProps) {
  const isEmpty = value === undefined || value === null || value === ''
  const display = isEmpty ? '—' : String(value)

  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={isEmpty ? styles.fieldEmpty : styles.fieldValue}>{display}</Text>
    </View>
  )
}
