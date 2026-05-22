import { TabKey } from '@/stores/formStore'

/**
 * Resultado da engine de classificação de prontidão.
 *
 * - `gerencial`: nível gerencial G1-G5 lido do select "Nível gerencial" da aba Torre Decisão.
 *   `null` quando o campo ainda não foi preenchido ou contém slug não mapeado.
 * - `habilitacoes`: classificação de maturidade HAB-A a HAB-E lida do select "Classificação final"
 *   da aba Hab. Classificação. `null` quando não preenchido.
 * - `ndaAceito`: `true` quando o checkbox "aceitaTermos" da aba NDA é `true`.
 */
export interface ReadinessResult {
  gerencial: 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | null
  habilitacoes: 'HAB-A' | 'HAB-B' | 'HAB-C' | 'HAB-D' | 'HAB-E' | null
  ndaAceito: boolean
}

/**
 * Engine pura de classificação de prontidão.
 *
 * Função pura e testável — sem React, sem efeitos colaterais, sem useState/useMemo.
 * Pode ser chamada diretamente em testes unitários sem montar componente.
 *
 * Lê três campos do sectionData da store Zustand:
 * - `sectionData[TabKey.TorreDecisao].nivelGerencial` — slugs lowercase 'g1'..'g5'
 * - `sectionData[TabKey.HabClassificacao].classificacaoFinal` — slugs 'hab-a'..'hab-e'
 * - `sectionData[TabKey.Nda].aceitaTermos` — boolean
 *
 * Retorna `null` para gerencial/habilitacoes quando o campo não está preenchido
 * (string vazia, undefined, ou slug não mapeado).
 */
export function calculateReadiness(
  sectionData: Partial<Record<TabKey, Record<string, unknown>>>
): ReadinessResult {
  const torreDecisao = sectionData[TabKey.TorreDecisao] ?? {}
  const habClassificacao = sectionData[TabKey.HabClassificacao] ?? {}
  const nda = sectionData[TabKey.Nda] ?? {}

  const rawGerencial = torreDecisao['nivelGerencial'] as string | undefined
  const rawHab = habClassificacao['classificacaoFinal'] as string | undefined

  // Mapa de slugs lowercase do schema torre-decisao.ts → display labels G1-G5
  const gerencialMap: Record<string, ReadinessResult['gerencial']> = {
    g1: 'G1',
    g2: 'G2',
    g3: 'G3',
    g4: 'G4',
    g5: 'G5',
  }

  // Mapa de slugs lowercase do schema hab-classificacao → display labels HAB-A..HAB-E
  const habMap: Record<string, ReadinessResult['habilitacoes']> = {
    'hab-a': 'HAB-A',
    'hab-b': 'HAB-B',
    'hab-c': 'HAB-C',
    'hab-d': 'HAB-D',
    'hab-e': 'HAB-E',
  }

  return {
    gerencial: rawGerencial ? (gerencialMap[rawGerencial] ?? null) : null,
    habilitacoes: rawHab ? (habMap[rawHab] ?? null) : null,
    ndaAceito: nda['aceitaTermos'] === true,
  }
}
