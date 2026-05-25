/**
 * PDFSectionTorre360 — Renderiza as 5 seções da Torre 360.
 * Abas: Identificação, Torre Decisão, Torre Sienge (aninhada), Torre Acesso, Torre Classificação.
 * D-03: campos vazios exibem '—' via PDFFieldRow.
 * Usa apenas primitivos de @react-pdf/renderer — sem hooks React, sem Tailwind.
 */
import { View, Text } from '@react-pdf/renderer'
import { StyleSheet } from '@react-pdf/renderer'
import { COLORS } from './styles'
import { PDFFieldRow } from './PDFFieldRow'
import { PDFSectionHeader } from './PDFSectionHeader'
import { FIELD_MAPS } from './fieldMaps'
import { SIENGE_MODULES } from '../../schemas/torre-sienge'

const sectionStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  subHeader: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    backgroundColor: '#EBF2FA',
    padding: 4,
    marginBottom: 4,
    marginTop: 8,
  },
  moduleGroup: {
    marginBottom: 8,
  },
})

interface PDFSectionTorre360Props {
  formData: Record<string, unknown>
}

/** Extrai um valor de um formData aninhado de forma segura com optional chaining. */
function getField(formData: Record<string, unknown>, tabKey: string, fieldKey: string): unknown {
  const tab = formData?.[tabKey]
  if (!tab || typeof tab !== 'object') return undefined
  return (tab as Record<string, unknown>)?.[fieldKey]
}

export function PDFSectionTorre360({ formData }: PDFSectionTorre360Props) {
  return (
    <View>
      {/* ── Identificação ────────────────────────────────────────────────── */}
      <View style={sectionStyles.container}>
        <PDFSectionHeader title="Identificação" />
        {FIELD_MAPS['identificacao'].map((entry) => (
          <PDFFieldRow
            key={entry.key}
            label={entry.label}
            value={getField(formData, 'identificacao', entry.key)}
          />
        ))}
      </View>

      {/* ── Torre Decisão ─────────────────────────────────────────────────── */}
      <View style={sectionStyles.container}>
        <PDFSectionHeader title="Torre Decisão" />
        {FIELD_MAPS['torre-decisao'].map((entry) => (
          <PDFFieldRow
            key={entry.key}
            label={entry.label}
            value={getField(formData, 'torre-decisao', entry.key)}
          />
        ))}
      </View>

      {/* ── Torre Sienge (estrutura aninhada — 12 módulos) ────────────────── */}
      <View style={sectionStyles.container} break>
        <PDFSectionHeader title="Torre Sienge" />
        {SIENGE_MODULES.map((module) => {
          const moduleData = (() => {
            const tab = formData?.['torre-sienge']
            if (!tab || typeof tab !== 'object') return undefined
            const modules = (tab as Record<string, unknown>)?.['modules']
            if (!modules || typeof modules !== 'object') return undefined
            return (modules as Record<string, unknown>)?.[module.slug]
          })()

          const getModuleField = (col: string): unknown => {
            if (!moduleData || typeof moduleData !== 'object') return undefined
            return (moduleData as Record<string, unknown>)?.[col]
          }

          return (
            <View key={module.slug} style={sectionStyles.moduleGroup}>
              <Text style={sectionStyles.subHeader}>{module.label}</Text>
              <PDFFieldRow label="Contratado" value={getModuleField('contratado')} />
              <PDFFieldRow label="Uso Real" value={getModuleField('usoReal')} />
              <PDFFieldRow label="Confiança do Dado" value={getModuleField('confiancaDado')} />
              <PDFFieldRow label="Controle Paralelo" value={getModuleField('controleParalelo')} />
              <PDFFieldRow label="Observações" value={getModuleField('observacoes')} />
            </View>
          )
        })}
      </View>

      {/* ── Torre Acesso ──────────────────────────────────────────────────── */}
      <View style={sectionStyles.container}>
        <PDFSectionHeader title="Torre Acesso" />
        {FIELD_MAPS['torre-acesso'].map((entry) => (
          <PDFFieldRow
            key={entry.key}
            label={entry.label}
            value={getField(formData, 'torre-acesso', entry.key)}
          />
        ))}
      </View>

      {/* ── Torre Classificação ───────────────────────────────────────────── */}
      <View style={sectionStyles.container}>
        <PDFSectionHeader title="Torre Classificação" />
        {FIELD_MAPS['torre-classificacao'].map((entry) => (
          <PDFFieldRow
            key={entry.key}
            label={entry.label}
            value={getField(formData, 'torre-classificacao', entry.key)}
          />
        ))}
      </View>
    </View>
  )
}
