import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Spinner } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import type { Grade } from '@/components/ui/badge'
import { useAssessmentDetail } from '@/features/admin/useAssessmentDetail'
import { useOrgDetail } from '@/features/admin/useOrgDetail'
import { SIENGE_MODULES, type SiengeModuleSlug } from '@/schemas/torre-sienge'
import { HAB_SCENARIOS, type HabScenarioSlug } from '@/schemas/hab-venda'
import { HAB_DOCUMENT_DOMAINS, type HabDocumentSlug } from '@/schemas/hab-repositorios'
import { HAB_RESPONSIBILITIES, type HabResponsabilidadeSlug } from '@/schemas/hab-responsaveis'

// ---------------------------------------------------------------------------
// Label maps — traduz slugs de enums para texto legível
// ---------------------------------------------------------------------------

const L = {
  reuniaoGestao: {
    semanal: 'Semanal',
    quinzenal: 'Quinzenal',
    mensal: 'Mensal',
    eventual: 'Eventual',
    'nao-estruturada': 'Não estruturada',
  },
  comoInformacaoChega: {
    'bi-dashboard': 'BI/dashboard',
    excel: 'Excel/planilhas',
    'relatorios-sienge': 'Relatórios Sienge',
    pdf: 'PDF/apresentação',
    'email-whatsapp': 'E-mail/WhatsApp',
    misto: 'Misto',
  },
  existeBI: {
    'sim-power-bi': 'Sim, Power BI',
    'sim-outra': 'Sim, outra ferramenta',
    'em-implantacao': 'Em implantação',
    nao: 'Não',
  },
  nivelGerencial: {
    g1: 'G1 — Decisão informal',
    g2: 'G2 — Relatórios manuais',
    g3: 'G3 — BI parcial',
    g4: 'G4 — Gestão orientada por dados',
    g5: 'G5 — Gestão avançada',
  },
  decisoesMelhorar: {
    caixa: 'Caixa realizado/projetado',
    contas: 'Contas a pagar/receber',
    inadimplencia: 'Inadimplência',
    margem: 'Margem por obra',
    'orcado-realizado': 'Orçado x realizado',
    'avanco-fisico': 'Avanço físico/prazo',
    'compras-criticas': 'Compras críticas',
    'vendas-estoque': 'Vendas/estoque',
    'pos-obra': 'Pós-obra/qualidade',
  },
  // Torre Sienge columns
  contratado: { sim: 'Sim', nao: 'Não', 'nao-sabe': 'N/S', 'nao-aplicavel': 'N/A' },
  usoReal: { total: 'Total', parcial: 'Parcial', baixo: 'Baixo', 'nao-usa': 'Não usa' },
  confiancaDado: { alta: 'Alta', media: 'Média', baixa: 'Baixa', 'nao-confiavel': 'Não confiável' },
  controleParalelo: { nao: 'Não', excel: 'Excel', bi: 'BI', outro: 'Outro', informal: 'Informal' },
  // Torre Acesso
  ambienteSienge: {
    'nuvem-data-center': 'Nuvem/Data center',
    local: 'Local (on-premise)',
    hibrido: 'Híbrido',
    confirmar: 'A confirmar',
  },
  simNaoConfirmar: { sim: 'Sim', nao: 'Não', confirmar: 'A confirmar' },
  apiRest: {
    disponivel: 'Disponível',
    'nao-disponivel': 'Não disponível',
    confirmar: 'A confirmar',
    parcial: 'Parcial',
  },
  seTudoNoSienge: {
    'modulos-alimentados': 'Módulos alimentados',
    'empresas-obras-centros': 'Empresas, obras e centros de custo cadastrados',
    'historico-minimo': 'Histórico mínimo de 12 meses',
    'api-bulk-autorizado': 'API/bulk autorizado pelo Sienge',
    'limites-compativeis': 'Limites de requisições compatíveis',
    'regras-validadas': 'Regras de negócio validadas',
  },
  // Torre Classificação
  torreClassificacaoFinal: {
    't360-a': 'T360-A — Integração direta Sienge',
    't360-b': 'T360-B — Híbrida Sienge + BI',
    't360-c': 'T360-C — Ativação de dados existentes',
    't360-d': 'T360-D — Reconciliação via BI',
    't360-e': 'T360-E — Projeto preparatório',
  },
  abordagemTorre: {
    'integracao-sienge': 'Integração direta Sienge',
    'hibrida-sienge-bi': 'Híbrida Sienge + BI',
    'ativacao-dados': 'Ativação de dados existentes',
    'reconciliacao-bi': 'Reconciliação via BI',
    'projeto-preparatorio': 'Projeto preparatório',
  },
  evidenciasSolicitar: {
    'modulos-contratados': 'Módulos contratados',
    'confirmacao-api-bulk': 'Confirmação API/bulk',
    'relatorios-diretoria': 'Relatórios da diretoria',
    'bi-atual': 'BI atual',
    'planilhas-criticas': 'Planilhas críticas',
    'cnpjs-obras': 'CNPJs e obras',
    'fluxo-caixa': 'Fluxo de caixa',
    'orcamento-realizado': 'Orçado x realizado',
    'responsaveis-area': 'Responsáveis por área',
  },
  // Hab Venda
  principalFormaVenda: {
    'venda-propria': 'Venda própria/incorporação',
    'contratos-privados': 'Contratos privados',
    licitacoes: 'Licitações',
    'obras-terceiros': 'Obras por terceiros',
    'financiamento-habitacional': 'Financiamento habitacional',
    misto: 'Misto',
  },
  quemPedeDocumentos: {
    bancos: 'Bancos',
    'clientes-privados': 'Clientes privados',
    'orgaos-publicos': 'Órgãos públicos',
    seguradoras: 'Seguradoras',
    cartorios: 'Cartórios',
    investidores: 'Investidores',
    misto: 'Misto',
  },
  prazoTipico: {
    'mesmo-dia': 'Mesmo dia',
    '1-3-dias': '1–3 dias',
    'ate-1-semana': 'Até 1 semana',
    'mais-1-semana': 'Mais de 1 semana',
    'sem-padrao': 'Sem padrão definido',
  },
  perdeuOportunidade: { sim: 'Sim', nao: 'Não', quase: 'Quase', 'nao-sabe': 'Não sabe' },
  acontece: { sim: 'Sim', nao: 'Não', parcial: 'Parcial', 'nao-sabe': 'N/S' },
  importancia: { alta: 'Alta', media: 'Média', baixa: 'Baixa', eventual: 'Eventual' },
  // Hab Repositórios
  ondeDocumentosVivem: {
    'google-drive': 'Google Drive',
    'onedrive-sharepoint': 'OneDrive/SharePoint',
    dropbox: 'Dropbox',
    'servidor-local': 'Servidor local',
    'sienge-erp': 'Sienge/ERP',
    'sistema-juridico': 'Sistema jurídico',
    contador: 'Contador',
    'escritorio-juridico': 'Escritório jurídico',
    'email-whatsapp': 'E-mail/WhatsApp',
    'pastas-fisicas': 'Pastas físicas',
    'terceiros-fornecedores': 'Terceiros/fornecedores',
    'nao-ha-padrao': 'Sem padrão definido',
  },
  simParcialNao: { sim: 'Sim', parcial: 'Parcial', nao: 'Não' },
  existeControle: { sim: 'Sim', parcial: 'Parcial', nao: 'Não', 'nao-sabe': 'N/S' },
  repositorioPrincipal: {
    ged: 'GED',
    'pasta-local': 'Pasta local',
    'google-drive': 'Google Drive',
    sharepoint: 'SharePoint',
    'nao-possui': 'Não possui',
  },
  // Hab Responsáveis
  dificuldadesRecorrentes: {
    'documento-vencido': 'Documento vencido',
    'documento-nao-localizado': 'Documento não localizado',
    'dependencia-contador': 'Dependência do contador',
    'dependencia-juridico': 'Dependência do jurídico',
    'dependencia-engenharia': 'Dependência da engenharia',
    'dependencia-fornecedores': 'Dependência de fornecedores',
    'duvida-aplicabilidade': 'Dúvida sobre aplicabilidade',
    'falta-padrao-envio': 'Falta de padrão de envio',
    'retrabalho-kit': 'Retrabalho ao montar kit',
    'documentos-whatsapp': 'Documentos chegam por WhatsApp',
    'falta-historico': 'Falta de histórico',
    'sem-dono-processo': 'Sem dono de processo',
  },
  tempoMedioKit: {
    'mesmo-dia': 'Mesmo dia',
    '1-3-dias': '1–3 dias',
    'ate-1-semana': 'Até 1 semana',
    'mais-1-semana': 'Mais de 1 semana',
    'nao-medem': 'Não medem',
  },
  existeSubstituto: { sim: 'Sim', parcial: 'Parcial', nao: 'Não', 'nao-sabe': 'N/S' },
  terceiroDependente: { sim: 'Sim', parcial: 'Parcial', nao: 'Não', 'nao-sabe': 'N/S' },
  // Hab Classificação
  habClassificacaoFinal: {
    'hab-a': 'HAB-A — Implantação direta',
    'hab-b': 'HAB-B — Implantação com carga assistida',
    'hab-c': 'HAB-C — Ativar repositório e responsáveis',
    'hab-d': 'HAB-D — Começar por dossiê específico',
    'hab-e': 'HAB-E — Fase preparatória',
  },
  abordagemHab: {
    'implantar-direto': 'Implantar diretamente',
    'implantar-carga-assistida': 'Implantar com carga assistida',
    'ativar-repositorio-responsaveis': 'Ativar repositório e responsáveis',
    'comecar-dossie-especifico': 'Começar por dossiê específico',
    'fase-preparatoria': 'Fase preparatória',
  },
  escopoInicialSugerido: {
    'empresa-cnpj': 'Empresa / CNPJ',
    'obra-empreendimento': 'Obra / empreendimento',
    financiamento: 'Financiamento',
    licitacao: 'Licitação',
    'contrato-privado-homologacao': 'Contrato privado / homologação',
    'fiscalizacao-auditoria': 'Fiscalização / auditoria',
    'misto-reduzido': 'Misto reduzido',
  },
  complexidadePreco: { baixa: 'Baixa', media: 'Média', alta: 'Alta', critica: 'Crítica' },
} as const

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

function str(v: unknown): string {
  if (v === null || v === undefined || v === '') return ''
  return String(v)
}

function xlate(map: Record<string, string>, slug: unknown): string {
  const s = str(slug)
  return (map as Record<string, string>)[s] ?? s
}

function arr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []
}

function obj(v: unknown): Record<string, unknown> {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, unknown>
  return {}
}

// ---------------------------------------------------------------------------
// Primitive display components
// ---------------------------------------------------------------------------

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[200px_1fr] gap-x-4 border-b border-gray-100 py-2 last:border-0">
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900">{value || <span className="text-gray-300">—</span>}</dd>
    </div>
  )
}

function TagList({ values, map }: { values: string[]; map: Record<string, string> }) {
  if (!values.length) return <span className="text-sm text-gray-300">—</span>
  return (
    <div className="flex flex-wrap gap-1">
      {values.map((v) => (
        <span
          key={v}
          className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
        >
          {(map as Record<string, string>)[v] ?? v}
        </span>
      ))}
    </div>
  )
}

function SectionPanel({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white print:break-inside-avoid">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50 print:pointer-events-none"
      >
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <span className="text-gray-400 print:hidden">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="border-t border-gray-100 px-5 py-4 print:block">{children}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section panels
// ---------------------------------------------------------------------------

function IdentificacaoPanel({ data }: { data: Record<string, unknown> }) {
  return (
    <SectionPanel title="1. Identificação">
      <dl>
        <FieldRow label="Empresa / grupo" value={str(data.empresa)} />
        <FieldRow label="CNPJ principal" value={str(data.cnpj)} />
        <FieldRow label="Cidade/UF" value={str(data.cidadeUf)} />
        <FieldRow label="Resp. Torre 360" value={str(data.responsavelSienge)} />
        <FieldRow label="Resp. Habilitações" value={str(data.responsavelHabilitacoes)} />
        <FieldRow label="Conduz oportunidades comerciais" value={str(data.quemConduzComercial)} />
        <FieldRow label="Nº de CNPJs/SPEs no escopo" value={str(data.numCnpjsEscopo)} />
        <FieldRow label="Nº de obras/empreendimentos ativos" value={str(data.numObrasAtivas)} />
        <FieldRow label="Data da reunião" value={str(data.dataReuniao)} />
        <FieldRow label="Sponsor do piloto" value={str(data.sponsorPiloto)} />
        <FieldRow label="Participantes e papéis" value={str(data.participantes)} />
        <FieldRow label="Prioridade Torre 360" value={str(data.prioridadeTorre360)} />
        <FieldRow label="Prioridade Habilitações" value={str(data.prioridadeHabilitacoes)} />
      </dl>
    </SectionPanel>
  )
}

function TorreDecisaoPanel({ data }: { data: Record<string, unknown> }) {
  return (
    <SectionPanel title="2. Torre Decisão">
      <dl className="mb-4">
        <FieldRow label="Reunião de gestão" value={xlate(L.reuniaoGestao, data.reuniaoGestao)} />
        <FieldRow
          label="Como a informação chega"
          value={xlate(L.comoInformacaoChega, data.comoInformacaoChega)}
        />
        <FieldRow label="Existe BI hoje" value={xlate(L.existeBI, data.existeBI)} />
        {!!data.qualBI && <FieldRow label="Qual ferramenta de BI" value={str(data.qualBI)} />}
        <FieldRow label="Quem prepara a informação" value={str(data.quemPreparaInfo)} />
        <FieldRow
          label="Nível gerencial atual"
          value={xlate(L.nivelGerencial, data.nivelGerencial)}
        />
        <FieldRow
          label="Relatórios/dashboards da diretoria"
          value={str(data.relatoriosDiretoria)}
        />
        <FieldRow label="Números questionados/divergentes" value={str(data.numerosQuestionados)} />
        <FieldRow label="Observações gerenciais" value={str(data.observacoesGerenciais)} />
      </dl>
      <div>
        <p className="mb-1 text-xs font-medium text-gray-500">Decisões a melhorar</p>
        <TagList values={arr(data.decisoesMelhorar)} map={L.decisoesMelhorar} />
      </div>
    </SectionPanel>
  )
}

function TorreSiengePanel({ data }: { data: Record<string, unknown> }) {
  const modules = obj(data.modules)
  return (
    <SectionPanel title="3. Torre Sienge">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="py-2 pr-3 font-medium">Módulo</th>
              <th className="px-2 py-2 font-medium">Contratado</th>
              <th className="px-2 py-2 font-medium">Uso real</th>
              <th className="px-2 py-2 font-medium">Confiança</th>
              <th className="px-2 py-2 font-medium">Controle paralelo</th>
              <th className="px-2 py-2 font-medium">Observações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {SIENGE_MODULES.map((m) => {
              const row = obj(modules[m.slug as SiengeModuleSlug])
              return (
                <tr key={m.slug} className="align-top">
                  <td className="py-2 pr-3 font-medium text-gray-800">{m.label}</td>
                  <td className="px-2 py-2 text-gray-600">{xlate(L.contratado, row.contratado)}</td>
                  <td className="px-2 py-2 text-gray-600">{xlate(L.usoReal, row.usoReal)}</td>
                  <td className="px-2 py-2 text-gray-600">
                    {xlate(L.confiancaDado, row.confiancaDado)}
                  </td>
                  <td className="px-2 py-2 text-gray-600">
                    {xlate(L.controleParalelo, row.controleParalelo)}
                  </td>
                  <td className="px-2 py-2 text-gray-600">{str(row.observacoes) || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </SectionPanel>
  )
}

function TorreAcessoPanel({ data }: { data: Record<string, unknown> }) {
  return (
    <SectionPanel title="4. Torre Acesso">
      <dl className="mb-4">
        <FieldRow label="Ambiente Sienge" value={xlate(L.ambienteSienge, data.ambienteSienge)} />
        <FieldRow
          label="Subdomínio/tenant próprio"
          value={xlate(L.simNaoConfirmar, data.subdominioTenant)}
        />
        <FieldRow
          label="Usuário de leitura possível"
          value={xlate(L.simNaoConfirmar, data.usuarioLeitura)}
        />
        <FieldRow
          label="Ambiente de homologação"
          value={xlate(L.simNaoConfirmar, data.ambienteHomologacao)}
        />
        <FieldRow label="API REST" value={xlate(L.apiRest, data.apiRest)} />
        <FieldRow label="Bulk data" value={xlate(L.apiRest, data.bulkData)} />
        <FieldRow
          label="Pacote com limite de API"
          value={xlate(L.simNaoConfirmar, data.pacoteLimiteApi)}
        />
        <FieldRow
          label="Webhooks relevantes"
          value={xlate(L.simNaoConfirmar, data.webhooksRelevantes)}
        />
        <FieldRow label="Outras fontes de dados" value={str(data.outrasFontes)} />
        <FieldRow label="Restrições de segurança" value={str(data.restricoesSeguranca)} />
        <FieldRow label="Observação técnica" value={str(data.observacaoTecnica)} />
      </dl>
      <div>
        <p className="mb-1 text-xs font-medium text-gray-500">
          Se todos os dados estiverem no Sienge (confirmados)
        </p>
        <TagList values={arr(data.seTudoNoSienge)} map={L.seTudoNoSienge} />
      </div>
    </SectionPanel>
  )
}

function TorreClassificacaoPanel({ data }: { data: Record<string, unknown> }) {
  return (
    <SectionPanel title="5. Torre Classificação">
      <dl className="mb-4">
        <FieldRow
          label="Classificação final Torre"
          value={xlate(L.torreClassificacaoFinal, data.classificacaoFinal)}
        />
        <FieldRow
          label="Abordagem recomendada"
          value={xlate(L.abordagemTorre, data.abordagemRecomendada)}
        />
        <FieldRow label="Justificativa" value={str(data.justificativa)} />
        <FieldRow label="Fase 1" value={str(data.fase1)} />
        <FieldRow label="Fase 2" value={str(data.fase2)} />
        <FieldRow label="Fora do escopo" value={str(data.foraEscopo)} />
        <FieldRow label="Riscos" value={str(data.riscos)} />
        <FieldRow label="Próximos passos" value={str(data.proximosPassos)} />
      </dl>
      <div>
        <p className="mb-1 text-xs font-medium text-gray-500">Evidências a solicitar</p>
        <TagList values={arr(data.evidenciasSolicitar)} map={L.evidenciasSolicitar} />
      </div>
    </SectionPanel>
  )
}

function HabVendaPanel({ data }: { data: Record<string, unknown> }) {
  const scenarios = obj(data.scenarios)
  return (
    <SectionPanel title="6. Hab. Venda">
      <dl className="mb-4">
        <FieldRow
          label="Principal forma de venda"
          value={xlate(L.principalFormaVenda, data.principalFormaVenda)}
        />
        <FieldRow
          label="Quem pede documentos"
          value={xlate(L.quemPedeDocumentos, data.quemPedeDocumentos)}
        />
        <FieldRow label="Prazo típico" value={xlate(L.prazoTipico, data.prazoTipico)} />
        <FieldRow
          label="Perdeu oportunidade por documentação"
          value={xlate(L.perdeuOportunidade, data.perdeuOportunidade)}
        />
        <FieldRow label="Principais exigências" value={str(data.principaisExigencias)} />
        <FieldRow label="Onde costuma travar" value={str(data.ondeCostumaTravar)} />
      </dl>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="py-2 pr-3 font-medium">Cenário</th>
              <th className="px-2 py-2 font-medium">Acontece</th>
              <th className="px-2 py-2 font-medium">Importância</th>
              <th className="px-2 py-2 font-medium">Quem conduz</th>
              <th className="px-2 py-2 font-medium">Principal dificuldade</th>
              <th className="px-2 py-2 font-medium">Observações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {HAB_SCENARIOS.map((s) => {
              const row = obj(scenarios[s.slug as HabScenarioSlug])
              return (
                <tr key={s.slug} className="align-top">
                  <td className="py-2 pr-3 font-medium text-gray-800">{s.label}</td>
                  <td className="px-2 py-2 text-gray-600">{xlate(L.acontece, row.acontece)}</td>
                  <td className="px-2 py-2 text-gray-600">
                    {xlate(L.importancia, row.importancia)}
                  </td>
                  <td className="px-2 py-2 text-gray-600">{str(row.quemConduz) || '—'}</td>
                  <td className="px-2 py-2 text-gray-600">
                    {str(row.principalDificuldade) || '—'}
                  </td>
                  <td className="px-2 py-2 text-gray-600">{str(row.observacoes) || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </SectionPanel>
  )
}

function HabRepositoriosPanel({ data }: { data: Record<string, unknown> }) {
  const documents = obj(data.documents)
  return (
    <SectionPanel title="7. Hab. Repositórios">
      <dl className="mb-4">
        <div className="border-b border-gray-100 py-2">
          <dt className="mb-1 text-xs font-medium text-gray-500">Onde os documentos vivem hoje</dt>
          <dd>
            <TagList values={arr(data.ondeDocumentosVivem)} map={L.ondeDocumentosVivem} />
          </dd>
        </div>
        <FieldRow
          label="Padrão de pastas/subpastas"
          value={xlate(L.simParcialNao, data.existePadraoPastas)}
        />
        <FieldRow
          label="Padrão de nomenclatura"
          value={xlate(L.simParcialNao, data.existePadraoNomes)}
        />
        <FieldRow
          label="Controlam validade"
          value={xlate(L.simParcialNao, data.controlamValidade)}
        />
        <FieldRow
          label="Trilha de versão/auditoria"
          value={xlate(L.simParcialNao, data.existeTrilhaVersao)}
        />
        <FieldRow label="Observações" value={str(data.observacoesRepositorios)} />
      </dl>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="py-2 pr-3 font-medium">Domínio</th>
              <th className="px-2 py-2 font-medium">Existe controle</th>
              <th className="px-2 py-2 font-medium">Repositório</th>
              <th className="px-2 py-2 font-medium">Responsável interno</th>
              <th className="px-2 py-2 font-medium">Terceiros envolvidos</th>
              <th className="px-2 py-2 font-medium">Observações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {HAB_DOCUMENT_DOMAINS.map((d) => {
              const row = obj(documents[d.slug as HabDocumentSlug])
              return (
                <tr key={d.slug} className="align-top">
                  <td className="py-2 pr-3 font-medium text-gray-800">{d.label}</td>
                  <td className="px-2 py-2 text-gray-600">
                    {xlate(L.existeControle, row.existeControle)}
                  </td>
                  <td className="px-2 py-2 text-gray-600">
                    {xlate(L.repositorioPrincipal, row.repositorioPrincipal)}
                  </td>
                  <td className="px-2 py-2 text-gray-600">{str(row.responsavelInterno) || '—'}</td>
                  <td className="px-2 py-2 text-gray-600">{str(row.terceirosEnvolvidos) || '—'}</td>
                  <td className="px-2 py-2 text-gray-600">{str(row.observacoes) || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </SectionPanel>
  )
}

function HabResponsaveisPanel({ data }: { data: Record<string, unknown> }) {
  const responsibilities = obj(data.responsibilities)
  return (
    <SectionPanel title="8. Hab. Responsáveis">
      <dl className="mb-4">
        <div className="border-b border-gray-100 py-2">
          <dt className="mb-1 text-xs font-medium text-gray-500">Dificuldades recorrentes</dt>
          <dd>
            <TagList values={arr(data.dificuldadesRecorrentes)} map={L.dificuldadesRecorrentes} />
          </dd>
        </div>
        <FieldRow
          label="Tempo médio para montar kit"
          value={xlate(L.tempoMedioKit, data.tempoMedioKit)}
        />
        <FieldRow
          label="Existe checklist de montagem"
          value={xlate(L.simParcialNao, data.existeChecklist)}
        />
        <FieldRow
          label="Existe processo de renovação"
          value={xlate(L.simParcialNao, data.existeRenovacao)}
        />
        <FieldRow
          label="Existe validação antes do envio"
          value={xlate(L.simParcialNao, data.existeValidacao)}
        />
        <FieldRow label="Observações sobre rotina" value={str(data.observacoesRotina)} />
      </dl>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="py-2 pr-3 font-medium">Atividade</th>
              <th className="px-2 py-2 font-medium">Quem faz</th>
              <th className="px-2 py-2 font-medium">Existe substituto</th>
              <th className="px-2 py-2 font-medium">Terceiro dependente</th>
              <th className="px-2 py-2 font-medium">Maior dificuldade</th>
              <th className="px-2 py-2 font-medium">Observações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {HAB_RESPONSIBILITIES.map((r) => {
              const row = obj(responsibilities[r.slug as HabResponsabilidadeSlug])
              return (
                <tr key={r.slug} className="align-top">
                  <td className="py-2 pr-3 font-medium text-gray-800">{r.label}</td>
                  <td className="px-2 py-2 text-gray-600">{str(row.quemFaz) || '—'}</td>
                  <td className="px-2 py-2 text-gray-600">
                    {xlate(L.existeSubstituto, row.existeSubstituto)}
                  </td>
                  <td className="px-2 py-2 text-gray-600">
                    {xlate(L.terceiroDependente, row.terceiroDependente)}
                  </td>
                  <td className="px-2 py-2 text-gray-600">{str(row.maiorDificuldade) || '—'}</td>
                  <td className="px-2 py-2 text-gray-600">{str(row.observacoes) || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </SectionPanel>
  )
}

function HabClassificacaoPanel({ data }: { data: Record<string, unknown> }) {
  return (
    <SectionPanel title="9. Hab. Classificação">
      <dl>
        <FieldRow
          label="Classificação final HAB"
          value={xlate(L.habClassificacaoFinal, data.classificacaoFinal)}
        />
        <FieldRow
          label="Abordagem recomendada"
          value={xlate(L.abordagemHab, data.abordagemRecomendada)}
        />
        <FieldRow
          label="Escopo inicial sugerido"
          value={xlate(L.escopoInicialSugerido, data.escopoInicialSugerido)}
        />
        <FieldRow
          label="Complexidade/preço estimado"
          value={xlate(L.complexidadePreco, data.complexidadePreco)}
        />
        <FieldRow label="Fase 1" value={str(data.fase1)} />
        <FieldRow label="Fase 2" value={str(data.fase2)} />
        <FieldRow label="Riscos principais" value={str(data.riscosPrincipais)} />
        <FieldRow label="Evidências essenciais" value={str(data.evidenciasEssenciais)} />
        <FieldRow label="Observações finais" value={str(data.observacoesFinais)} />
      </dl>
    </SectionPanel>
  )
}

function NdaPanel({ data }: { data: Record<string, unknown> }) {
  const aceito = data.aceitaTermos === true
  return (
    <SectionPanel title="10. NDA">
      <dl>
        <div className="border-b border-gray-100 py-2">
          <dt className="text-xs font-medium text-gray-500">Termos aceitos</dt>
          <dd className="mt-1">
            {aceito ? (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                Aceito
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                Não aceito
              </span>
            )}
          </dd>
        </div>
        <FieldRow label="Nome do representante" value={str(data.nomeRepresentante)} />
        <FieldRow label="Cargo" value={str(data.cargo)} />
        <FieldRow label="CPF" value={str(data.cpf)} />
        <FieldRow label="Data do aceite" value={str(data.dataAceite)} />
        <FieldRow label="Observações" value={str(data.observacoes)} />
      </dl>
    </SectionPanel>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export function AssessmentView() {
  const { orgId, assessmentId } = useParams<{ orgId: string; assessmentId: string }>()
  const { org } = useOrgDetail(orgId)
  const { data: assessment, isLoading, isError } = useAssessmentDetail(assessmentId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError || !assessment) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-red-600">Erro ao carregar avaliação.</p>
        <Link to={`/admin/orgs/${orgId}`} className="text-primary text-sm hover:underline">
          ← Voltar para {org?.name ?? 'Organização'}
        </Link>
      </div>
    )
  }

  const fd = (assessment.form_data ?? {}) as Record<string, Record<string, unknown>>

  const formattedDate = assessment.submitted_at
    ? new Date(assessment.submitted_at).toLocaleDateString('pt-BR') +
      ' às ' +
      new Date(assessment.submitted_at).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="text-sm print:hidden" aria-label="Breadcrumb">
        <Link to="/admin/dashboard" className="text-gray-500 hover:text-gray-900">
          Organizações
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link to={`/admin/orgs/${orgId}`} className="text-gray-500 hover:text-gray-900">
          {org?.name ?? '...'}
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="font-medium text-gray-900">Avaliação v{assessment.version}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 print:block">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {org?.name ?? '...'} — Avaliação v{assessment.version}
          </h1>
          {formattedDate && (
            <p className="mt-1 text-sm text-gray-500">Enviada em {formattedDate}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {assessment.readiness_level_mgmt && (
              <Badge grade={assessment.readiness_level_mgmt as Grade} />
            )}
            {assessment.readiness_level_tech && (
              <span className="text-sm font-medium text-gray-600">
                {assessment.readiness_level_tech}
              </span>
            )}
            {(fd['nda'] as Record<string, unknown> | undefined)?.aceitaTermos === true && (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                NDA aceito
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="shrink-0 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 print:hidden"
        >
          Imprimir / Exportar PDF
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <IdentificacaoPanel data={fd['identificacao'] ?? {}} />
        <TorreDecisaoPanel data={fd['torre-decisao'] ?? {}} />
        <TorreSiengePanel data={fd['torre-sienge'] ?? {}} />
        <TorreAcessoPanel data={fd['torre-acesso'] ?? {}} />
        <TorreClassificacaoPanel data={fd['torre-classificacao'] ?? {}} />
        <HabVendaPanel data={fd['hab-venda'] ?? {}} />
        <HabRepositoriosPanel data={fd['hab-repositorios'] ?? {}} />
        <HabResponsaveisPanel data={fd['hab-responsaveis'] ?? {}} />
        <HabClassificacaoPanel data={fd['hab-classificacao'] ?? {}} />
        <NdaPanel data={fd['nda'] ?? {}} />
      </div>
    </div>
  )
}
