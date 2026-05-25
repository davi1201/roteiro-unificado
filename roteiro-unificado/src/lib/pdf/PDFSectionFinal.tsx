/**
 * PDFSectionFinal — Página final com tabela de classificação G1-G5.
 * EXPORT-02: tabela com 5 colunas (Grade, Descrição, Gerencial, Técnico, Status).
 * Badge do nível gerencial em destaque 32pt centralizado com cor gradeColor.
 * Usa apenas primitivos de @react-pdf/renderer — sem hooks React, sem Tailwind.
 */
import { View, Text } from '@react-pdf/renderer'
import { StyleSheet } from '@react-pdf/renderer'
import { COLORS, gradeColor } from './styles'
import { PDFSectionHeader } from './PDFSectionHeader'

const finalStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tableRowHighlighted: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: '#EBF2FA',
  },
  colGrade: {
    width: '12%',
    padding: 6,
  },
  colDescricao: {
    width: '28%',
    padding: 6,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  colGerencial: {
    width: '20%',
    padding: 6,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  colTecnico: {
    width: '20%',
    padding: 6,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  colStatus: {
    width: '20%',
    padding: 6,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  headerText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },
  cellText: {
    fontSize: 9,
    color: COLORS.textPrimary,
  },
  gradeCell: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  badgeSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  badgeLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  badgeLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeLargeText: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },
})

/** Definição das 5 classificações G1-G5. */
const GRADE_DEFINITIONS = [
  {
    grade: 'G1',
    descricao: 'Crítico',
    gerencial: 'Ausência de processos básicos de gestão',
    tecnico: 'Dados não confiáveis ou indisponíveis',
    status: 'Requer projeto preparatório',
  },
  {
    grade: 'G2',
    descricao: 'Baixo',
    gerencial: 'Processos informais e esporádicos',
    tecnico: 'Acesso limitado e inconsistente',
    status: 'Implantação com suporte intensivo',
  },
  {
    grade: 'G3',
    descricao: 'Médio',
    gerencial: 'Processos parcialmente estruturados',
    tecnico: 'Dados parcialmente estruturados',
    status: 'Implantação com suporte padrão',
  },
  {
    grade: 'G4',
    descricao: 'Bom',
    gerencial: 'Processos bem definidos e seguidos',
    tecnico: 'Dados estruturados e acessíveis',
    status: 'Implantação direta',
  },
  {
    grade: 'G5',
    descricao: 'Excelente',
    gerencial: 'Processos maduros e otimizados',
    tecnico: 'Dados de alta qualidade e integrados',
    status: 'Implantação acelerada',
  },
]

interface PDFSectionFinalProps {
  grade: string | null
  gradeTech: string | null
}

export function PDFSectionFinal({ grade, gradeTech }: PDFSectionFinalProps) {
  const gradeDisplay = grade ?? '—'
  const badgeColor = gradeColor(grade)

  return (
    <View style={finalStyles.container}>
      <PDFSectionHeader title="Classificação de Prontidão" />
      <Text style={finalStyles.subtitle}>
        Resumo do nível de maturidade gerencial e técnica da organização
      </Text>

      {/* Tabela G1-G5 */}
      <View style={finalStyles.table}>
        {/* Cabeçalho */}
        <View style={finalStyles.tableHeaderRow}>
          <View style={finalStyles.colGrade}>
            <Text style={finalStyles.headerText}>Grade</Text>
          </View>
          <View style={finalStyles.colDescricao}>
            <Text style={finalStyles.headerText}>Descrição</Text>
          </View>
          <View style={finalStyles.colGerencial}>
            <Text style={finalStyles.headerText}>Gerencial</Text>
          </View>
          <View style={finalStyles.colTecnico}>
            <Text style={finalStyles.headerText}>Técnico</Text>
          </View>
          <View style={finalStyles.colStatus}>
            <Text style={finalStyles.headerText}>Status</Text>
          </View>
        </View>

        {/* Linhas de dados */}
        {GRADE_DEFINITIONS.map((row) => {
          const isHighlighted = row.grade === grade
          const rowStyle = isHighlighted ? finalStyles.tableRowHighlighted : finalStyles.tableRow

          return (
            <View key={row.grade} style={rowStyle}>
              <View style={finalStyles.colGrade}>
                <Text
                  style={[
                    finalStyles.gradeCell,
                    { color: gradeColor(row.grade) },
                  ]}
                >
                  {row.grade}
                </Text>
              </View>
              <View style={finalStyles.colDescricao}>
                <Text style={finalStyles.cellText}>{row.descricao}</Text>
              </View>
              <View style={finalStyles.colGerencial}>
                <Text style={finalStyles.cellText}>{row.gerencial}</Text>
              </View>
              <View style={finalStyles.colTecnico}>
                <Text style={finalStyles.cellText}>{row.tecnico}</Text>
              </View>
              <View style={finalStyles.colStatus}>
                <Text style={finalStyles.cellText}>{row.status}</Text>
              </View>
            </View>
          )
        })}
      </View>

      {/* Badge de nível gerencial em destaque */}
      <View style={finalStyles.badgeSection}>
        <Text style={finalStyles.badgeLabel}>Nível Gerencial:</Text>
        <View style={[finalStyles.badgeLarge, { backgroundColor: badgeColor }]}>
          <Text style={finalStyles.badgeLargeText}>{gradeDisplay}</Text>
        </View>
        {gradeTech && (
          <Text style={finalStyles.subtitle}>Nível Técnico: {gradeTech}</Text>
        )}
      </View>
    </View>
  )
}
