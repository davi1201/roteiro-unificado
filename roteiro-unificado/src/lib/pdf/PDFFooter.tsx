/**
 * PDFFooter — Rodapé fixo com paginação para o chunk PDF.
 * Usa apenas primitivos de @react-pdf/renderer — sem hooks, sem Tailwind.
 * Prop `fixed` garante que o rodapé aparece em todas as páginas.
 */
import { View, Text } from '@react-pdf/renderer'
import { styles } from './styles'

export function PDFFooter() {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>SuaEquipe.IA — Relatório Confidencial</Text>
      <Text
        style={styles.footerText}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  )
}
