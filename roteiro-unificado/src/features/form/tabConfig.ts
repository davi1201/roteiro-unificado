import { TabKey } from '@/stores/formStore'

/**
 * Configuração de uma aba do formulário de avaliação.
 */
export interface TabConfig {
  key: TabKey
  label: string
}

/**
 * Fonte única de verdade para os labels das 10 abas do formulário.
 * Mantém a ordem canônica: Identificação → NDA.
 * Importar esta constante em todos os componentes que renderizam a lista de abas.
 */
export const TAB_CONFIG: TabConfig[] = [
  { key: TabKey.Identificacao, label: 'Identificação' },
  { key: TabKey.TorreDecisao, label: 'Torre Decisão' },
  { key: TabKey.TorreSienge, label: 'Torre Sienge' },
  { key: TabKey.TorreAcesso, label: 'Torre Acesso' },
  { key: TabKey.TorreClassificacao, label: 'Torre Classificação' },
  { key: TabKey.HabVenda, label: 'Hab. Venda' },
  { key: TabKey.HabRepositorios, label: 'Hab. Repositórios' },
  { key: TabKey.HabResponsaveis, label: 'Hab. Responsáveis' },
  { key: TabKey.HabClassificacao, label: 'Hab. Classificação' },
  { key: TabKey.Nda, label: 'NDA' },
]
