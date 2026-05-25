/**
 * PDFCoverPage — Capa do Relatório de Prontidão Gerencial.
 * Fundo azul #123B66 full-page; marca tipográfica "SuaEquipe" + ".IA" (acento laranja);
 * metadados da construtora (orgName, cnpj, version, data); badge G1-G5 colorido.
 * D-01: identidade visual azul/laranja; D-02: metadados obrigatórios na capa.
 * Usa apenas primitivos de @react-pdf/renderer — sem hooks React, sem Tailwind.
 */
import { Page, View, Text } from '@react-pdf/renderer'
import { StyleSheet } from '@react-pdf/renderer'
import { COLORS, gradeColor } from './styles'
import type { AssessmentPDFData } from './types'

const coverStyles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.primary,
    padding: 40,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  brandText: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },
  brandAccent: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.accent,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    marginBottom: 32,
    letterSpacing: 0.5,
  },
  orgName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  cnpj: {
    fontSize: 12,
    color: '#CBD5E1',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 4,
  },
  generatedAt: {
    fontSize: 12,
    color: '#CBD5E1',
    marginBottom: 32,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  badgeLabel: {
    fontSize: 11,
    color: '#CBD5E1',
    marginRight: 12,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#1E4D7B',
    marginBottom: 24,
    marginTop: 8,
  },
})

interface PDFCoverPageProps {
  data: AssessmentPDFData
}

export function PDFCoverPage({ data }: PDFCoverPageProps) {
  const formattedDate = data.generatedAt.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const gradeDisplay = data.grade ?? '—'
  const badgeColor = gradeColor(data.grade)

  return (
    <Page size="A4" style={coverStyles.page}>
      {/* Marca tipográfica SuaEquipe.IA */}
      <View style={coverStyles.brandRow}>
        <Text style={coverStyles.brandText}>SuaEquipe</Text>
        <Text style={coverStyles.brandAccent}>.IA</Text>
      </View>

      {/* Título do relatório */}
      <Text style={coverStyles.title}>Relatório de Prontidão Gerencial</Text>

      {/* Divisor */}
      <View style={coverStyles.divider} />

      {/* Nome da construtora */}
      <Text style={coverStyles.orgName}>{data.orgName}</Text>

      {/* CNPJ com fallback */}
      <Text style={coverStyles.cnpj}>{data.cnpj ?? '—'}</Text>

      {/* Versão */}
      <Text style={coverStyles.version}>Avaliação v{data.version}</Text>

      {/* Data de geração */}
      <Text style={coverStyles.generatedAt}>Gerado em {formattedDate}</Text>

      {/* Badge de classificação gerencial G1-G5 */}
      <View style={coverStyles.badgeContainer}>
        <Text style={coverStyles.badgeLabel}>Nível Gerencial:</Text>
        <View style={[coverStyles.badge, { backgroundColor: badgeColor }]}>
          <Text style={coverStyles.badgeText}>{gradeDisplay}</Text>
        </View>
      </View>
    </Page>
  )
}
