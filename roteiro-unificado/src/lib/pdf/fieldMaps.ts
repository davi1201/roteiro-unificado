/**
 * Mapeamento de campos (label ↔ chave do schema) por aba do formulário.
 * Cobre as 9 abas com campos flat — torre-sienge é tratada à parte
 * (estrutura aninhada via SIENGE_MODULES em PDFSectionTorre360.tsx).
 *
 * Chaves no FIELD_MAPS são os TabKey values da store (ex: 'identificacao').
 * Chaves individuais em cada array são os nomes exatos dos campos Zod.
 */

/** Um par label/chave para exibição no PDF. */
export interface FieldMapEntry {
  key: string
  label: string
}

/**
 * Mapeamento de campos por aba.
 * Indexado pelo TabKey value (ex: 'identificacao', 'torre-decisao').
 * Abas com estrutura aninhada (torres de matriz) não estão aqui — ver SIENGE_MODULES.
 */
export const FIELD_MAPS: Record<string, FieldMapEntry[]> = {
  // ── Identificação ────────────────────────────────────────────────────────
  identificacao: [
    { key: 'empresa', label: 'Empresa' },
    { key: 'cnpj', label: 'CNPJ' },
    { key: 'cidadeUf', label: 'Cidade/UF' },
    { key: 'dataReuniao', label: 'Data da Reunião' },
    { key: 'participantes', label: 'Participantes' },
    { key: 'sponsorPiloto', label: 'Sponsor do Piloto' },
    { key: 'responsavelSienge', label: 'Responsável Sienge' },
    { key: 'responsavelHabilitacoes', label: 'Responsável Habilitações' },
    { key: 'quemConduzComercial', label: 'Quem Conduz Comercial' },
    { key: 'numCnpjsEscopo', label: 'Nº CNPJs no Escopo' },
    { key: 'numObrasAtivas', label: 'Nº Obras Ativas' },
    { key: 'prioridadeTorre360', label: 'Prioridade Torre 360' },
    { key: 'prioridadeHabilitacoes', label: 'Prioridade Habilitações' },
  ],

  // ── Torre Decisão ─────────────────────────────────────────────────────────
  'torre-decisao': [
    { key: 'reuniaoGestao', label: 'Frequência da Reunião de Gestão' },
    { key: 'comoInformacaoChega', label: 'Como a Informação Chega à Diretoria' },
    { key: 'existeBI', label: 'Existe Ferramenta de BI' },
    { key: 'qualBI', label: 'Qual Ferramenta de BI' },
    { key: 'nivelGerencial', label: 'Nível Gerencial (G1-G5)' },
    { key: 'quemPreparaInfo', label: 'Quem Prepara as Informações' },
    { key: 'relatoriosDiretoria', label: 'Relatórios da Diretoria' },
    { key: 'numerosQuestionados', label: 'Números Questionados/Divergentes' },
    { key: 'decisoesMelhorar', label: 'Decisões a Melhorar' },
    { key: 'observacoesGerenciais', label: 'Observações Gerenciais' },
  ],

  // ── Torre Acesso ──────────────────────────────────────────────────────────
  'torre-acesso': [
    { key: 'ambienteSienge', label: 'Ambiente Sienge' },
    { key: 'subdominioTenant', label: 'Subdomínio/Tenant' },
    { key: 'usuarioLeitura', label: 'Usuário de Leitura' },
    { key: 'ambienteHomologacao', label: 'Ambiente de Homologação' },
    { key: 'apiRest', label: 'API REST' },
    { key: 'bulkData', label: 'Bulk Data' },
    { key: 'pacoteLimiteApi', label: 'Pacote com Limite de API' },
    { key: 'webhooksRelevantes', label: 'Webhooks Relevantes' },
    { key: 'outrasFontes', label: 'Outras Fontes de Dados' },
    { key: 'restricoesSeguranca', label: 'Restrições de Segurança' },
    { key: 'seTudoNoSienge', label: 'Condições (se dados no Sienge)' },
    { key: 'observacaoTecnica', label: 'Observação Técnica' },
  ],

  // ── Torre Classificação ───────────────────────────────────────────────────
  'torre-classificacao': [
    { key: 'classificacaoFinal', label: 'Classificação Final' },
    { key: 'abordagemRecomendada', label: 'Abordagem Recomendada' },
    { key: 'justificativa', label: 'Justificativa' },
    { key: 'fase1', label: 'Fase 1' },
    { key: 'fase2', label: 'Fase 2' },
    { key: 'foraEscopo', label: 'Fora do Escopo' },
    { key: 'riscos', label: 'Riscos' },
    { key: 'evidenciasSolicitar', label: 'Evidências a Solicitar' },
    { key: 'proximosPassos', label: 'Próximos Passos' },
  ],

  // ── Hab. Venda ────────────────────────────────────────────────────────────
  'hab-venda': [
    { key: 'principalFormaVenda', label: 'Principal Forma de Venda' },
    { key: 'quemPedeDocumentos', label: 'Quem Pede Documentos' },
    { key: 'prazoTipico', label: 'Prazo Típico de Entrega' },
    { key: 'perdeuOportunidade', label: 'Perdeu Oportunidade por Documentação' },
    { key: 'principaisExigencias', label: 'Principais Exigências' },
    { key: 'ondeCostumaTravar', label: 'Onde Costuma Travar' },
  ],

  // ── Hab. Repositórios ─────────────────────────────────────────────────────
  'hab-repositorios': [
    { key: 'ondeDocumentosVivem', label: 'Onde os Documentos Vivem' },
    { key: 'existePadraoPastas', label: 'Existe Padrão de Pastas' },
    { key: 'existePadraoNomes', label: 'Existe Padrão de Nomes' },
    { key: 'controlamValidade', label: 'Controlam Validade' },
    { key: 'existeTrilhaVersao', label: 'Existe Trilha de Versão' },
    { key: 'observacoesRepositorios', label: 'Observações sobre Repositórios' },
  ],

  // ── Hab. Responsáveis ─────────────────────────────────────────────────────
  'hab-responsaveis': [
    { key: 'dificuldadesRecorrentes', label: 'Dificuldades Recorrentes' },
    { key: 'tempoMedioKit', label: 'Tempo Médio para Montar Kit' },
    { key: 'existeChecklist', label: 'Existe Checklist' },
    { key: 'existeRenovacao', label: 'Existe Processo de Renovação' },
    { key: 'existeValidacao', label: 'Existe Validação' },
    { key: 'observacoesRotina', label: 'Observações sobre Rotina' },
  ],

  // ── Hab. Classificação ────────────────────────────────────────────────────
  'hab-classificacao': [
    { key: 'classificacaoFinal', label: 'Classificação Final' },
    { key: 'abordagemRecomendada', label: 'Abordagem Recomendada' },
    { key: 'escopoInicialSugerido', label: 'Escopo Inicial Sugerido' },
    { key: 'complexidadePreco', label: 'Complexidade e Preço' },
    { key: 'fase1', label: 'Fase 1' },
    { key: 'fase2', label: 'Fase 2' },
    { key: 'riscosPrincipais', label: 'Riscos Principais' },
    { key: 'evidenciasEssenciais', label: 'Evidências Essenciais' },
    { key: 'observacoesFinais', label: 'Observações Finais' },
  ],

  // ── NDA ───────────────────────────────────────────────────────────────────
  nda: [
    { key: 'nomeRepresentante', label: 'Nome do Representante' },
    { key: 'cargo', label: 'Cargo' },
    { key: 'cpf', label: 'CPF' },
    { key: 'dataAceite', label: 'Data do Aceite' },
    { key: 'aceitaTermos', label: 'Aceita os Termos do NDA' },
    { key: 'observacoes', label: 'Observações' },
  ],
}
