/**
 * Paleta de cores e StyleSheet compartilhado para o chunk PDF.
 * Tokens Tailwind NÃO funcionam em StyleSheet do react-pdf — usar hex diretos.
 */
import { StyleSheet } from '@react-pdf/renderer'

/** Paleta de cores hardcoded para uso no @react-pdf/renderer. */
export const COLORS = {
  primary: '#123B66',
  accent: '#F28C28',
  white: '#FFFFFF',
  textPrimary: '#111827',
  textMuted: '#6B7280',
  textEmpty: '#9CA3AF',
  border: '#E5E7EB',
  // Escala de prontidão G1-G5
  g1: '#B91C1C',
  g2: '#F28C28',
  g3: '#D97706',
  g4: '#1D4ED8',
  g5: '#16A34A',
} as const

/**
 * Retorna a cor correspondente ao nível G1-G5.
 * Usa textMuted como fallback para valores inválidos ou nulos.
 */
export function gradeColor(grade: string | null): string {
  switch (grade) {
    case 'G1':
      return COLORS.g1
    case 'G2':
      return COLORS.g2
    case 'G3':
      return COLORS.g3
    case 'G4':
      return COLORS.g4
    case 'G5':
      return COLORS.g5
    default:
      return COLORS.textMuted
  }
}

/** StyleSheet compartilhado para todos os componentes do PDFDocument. */
export const styles = StyleSheet.create({
  // ── Página ──────────────────────────────────────────────────────────────
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },

  // ── Capa ─────────────────────────────────────────────────────────────────
  coverPage: {
    backgroundColor: COLORS.primary,
    padding: 40,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  coverBrand: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  coverBrandAccent: {
    color: COLORS.accent,
  },
  coverOrgName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  coverMeta: {
    fontSize: 12,
    color: '#CBD5E1',
    marginBottom: 4,
  },

  // ── Header de Seção ───────────────────────────────────────────────────────
  sectionHeader: {
    backgroundColor: COLORS.primary,
    padding: 6,
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },

  // ── Linha de Campo ────────────────────────────────────────────────────────
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingVertical: 2,
  },
  fieldLabel: {
    width: '40%',
    fontSize: 10,
    color: COLORS.textMuted,
  },
  fieldValue: {
    width: '60%',
    fontSize: 10,
    color: COLORS.textPrimary,
  },
  fieldEmpty: {
    width: '60%',
    fontSize: 10,
    color: COLORS.textEmpty,
  },

  // ── Rodapé ────────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
})
