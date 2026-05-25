/**
 * PDFSectionHeader — Barra de cabeçalho de seção azul (#123B66) para o chunk PDF.
 * Usa apenas primitivos de @react-pdf/renderer — sem hooks, sem Tailwind.
 */
import { View, Text } from '@react-pdf/renderer'
import { styles } from './styles'

interface PDFSectionHeaderProps {
  title: string
}

export function PDFSectionHeader({ title }: PDFSectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  )
}
