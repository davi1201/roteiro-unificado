/**
 * PDFSectionHabilitacoes — Renderiza as 4 seções de Habilitações + NDA.
 * Abas: Hab. Venda, Hab. Repositórios, Hab. Responsáveis, Hab. Classificação, NDA.
 * D-03: campos vazios exibem '—' via PDFFieldRow.
 * Usa apenas primitivos de @react-pdf/renderer — sem hooks React, sem Tailwind.
 */
import { View } from '@react-pdf/renderer'
import { PDFFieldRow } from './PDFFieldRow'
import { PDFSectionHeader } from './PDFSectionHeader'
import { FIELD_MAPS } from './fieldMaps'

interface PDFSectionHabilitacoesProps {
  formData: Record<string, unknown>
}

/** Extrai um valor de um formData aninhado de forma segura com optional chaining. */
function getField(formData: Record<string, unknown>, tabKey: string, fieldKey: string): unknown {
  const tab = formData?.[tabKey]
  if (!tab || typeof tab !== 'object') return undefined
  return (tab as Record<string, unknown>)?.[fieldKey]
}

export function PDFSectionHabilitacoes({ formData }: PDFSectionHabilitacoesProps) {
  return (
    <View>
      {/* ── Hab. Venda ───────────────────────────────────────────────────── */}
      <View>
        <PDFSectionHeader title="Hab. Venda" />
        {FIELD_MAPS['hab-venda'].map((entry) => (
          <PDFFieldRow
            key={entry.key}
            label={entry.label}
            value={getField(formData, 'hab-venda', entry.key)}
          />
        ))}
      </View>

      {/* ── Hab. Repositórios ─────────────────────────────────────────────── */}
      <View>
        <PDFSectionHeader title="Hab. Repositórios" />
        {FIELD_MAPS['hab-repositorios'].map((entry) => (
          <PDFFieldRow
            key={entry.key}
            label={entry.label}
            value={getField(formData, 'hab-repositorios', entry.key)}
          />
        ))}
      </View>

      {/* ── Hab. Responsáveis ─────────────────────────────────────────────── */}
      <View>
        <PDFSectionHeader title="Hab. Responsáveis" />
        {FIELD_MAPS['hab-responsaveis'].map((entry) => (
          <PDFFieldRow
            key={entry.key}
            label={entry.label}
            value={getField(formData, 'hab-responsaveis', entry.key)}
          />
        ))}
      </View>

      {/* ── Hab. Classificação ────────────────────────────────────────────── */}
      <View>
        <PDFSectionHeader title="Hab. Classificação" />
        {FIELD_MAPS['hab-classificacao'].map((entry) => (
          <PDFFieldRow
            key={entry.key}
            label={entry.label}
            value={getField(formData, 'hab-classificacao', entry.key)}
          />
        ))}
      </View>

      {/* ── NDA ──────────────────────────────────────────────────────────── */}
      <View>
        <PDFSectionHeader title="NDA — Acordo de Não-Divulgação" />
        {FIELD_MAPS['nda'].map((entry) => (
          <PDFFieldRow
            key={entry.key}
            label={entry.label}
            value={getField(formData, 'nda', entry.key)}
          />
        ))}
      </View>
    </View>
  )
}
