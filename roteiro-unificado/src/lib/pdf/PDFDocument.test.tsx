/**
 * Testes de renderização do PDFDocument.
 * Verifica que o documento compõe corretamente todas as seções
 * e aplica D-03 (campos vazios → '—').
 *
 * Usa mock do @react-pdf/renderer para ambiente jsdom:
 * o renderer real não funciona em jsdom (fontes, canvas).
 * O mock captura o texto passado para <Text> e permite verificar o conteúdo.
 */
import { describe, it, expect, vi } from 'vitest'
import React from 'react'

// ── Mock do @react-pdf/renderer ────────────────────────────────────────────
// Captura texto de <Text> em um array para inspeção nos testes.
const capturedTexts: string[] = []

vi.mock('@react-pdf/renderer', () => {
  const collectText = (children: unknown): void => {
    if (typeof children === 'string') {
      capturedTexts.push(children)
    } else if (Array.isArray(children)) {
      children.forEach(collectText)
    } else if (children && typeof children === 'object' && 'props' in children) {
      const node = children as { props?: { children?: unknown } }
      if (node.props?.children !== undefined) {
        collectText(node.props.children)
      }
    }
  }

  const Text = ({ children }: { children?: React.ReactNode }) => {
    collectText(children)
    return null
  }

  return {
    Document: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    Page: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    View: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    Text,
    StyleSheet: {
      create: <T extends object>(styles: T): T => styles,
    },
    pdf: vi.fn().mockReturnValue({
      toBlob: vi.fn().mockResolvedValue(new Blob(['%PDF-1.4'], { type: 'application/pdf' })),
    }),
  }
})

// ── Imports após o mock ────────────────────────────────────────────────────
import { PDFDocument } from './PDFDocument'
import type { AssessmentPDFData } from './types'

// ── Fixtures ───────────────────────────────────────────────────────────────

const completeData: AssessmentPDFData = {
  orgName: 'Construtora Exemplo Ltda',
  cnpj: '12.345.678/0001-99',
  version: 3,
  grade: 'G3',
  gradeTech: 'G2',
  generatedAt: new Date('2026-01-15T10:00:00Z'),
  formData: {
    identificacao: {
      empresa: 'Construtora Exemplo Ltda',
      cnpj: '12.345.678/0001-99',
      cidadeUf: 'São Paulo/SP',
    },
    'torre-decisao': {
      reuniaoGestao: 'mensal',
      nivelGerencial: 'g3',
    },
    'torre-sienge': {
      modules: {
        financeiro: {
          contratado: 'sim',
          usoReal: 'parcial',
        },
      },
    },
    'torre-acesso': {},
    'torre-classificacao': {},
    'hab-venda': {},
    'hab-repositorios': {},
    'hab-responsaveis': {},
    'hab-classificacao': {},
    nda: {
      nomeRepresentante: 'João Silva',
      aceitaTermos: true,
    },
  },
}

const emptyFormData: AssessmentPDFData = {
  orgName: 'Construtora Vazia SA',
  cnpj: null,
  version: 1,
  grade: null,
  gradeTech: null,
  generatedAt: new Date('2026-01-10T08:00:00Z'),
  formData: {},
}

// ── Testes ─────────────────────────────────────────────────────────────────

describe('PDFDocument', () => {
  it('renderiza com dados completos sem lançar e a saida contém orgName e marca SuaEquipe.IA', async () => {
    capturedTexts.length = 0

    const { renderToStaticMarkup } = await import('react-dom/server')

    let output: string | undefined
    expect(() => {
      output = renderToStaticMarkup(React.createElement(PDFDocument, { data: completeData }))
    }).not.toThrow()

    // Verifica que o render não lançou (output definido)
    expect(output).toBeDefined()

    // Verifica que o orgName e a marca aparecem no conteúdo capturado pelo mock
    const allText = capturedTexts.join(' ')
    expect(allText).toContain('Construtora Exemplo Ltda')
    expect(allText).toContain('SuaEquipe')
    expect(allText).toContain('.IA')
  })

  it('renderiza com formData vazio sem lançar e a saida contém ao menos uma ocorrencia de "—" (D-03)', async () => {
    capturedTexts.length = 0

    const { renderToStaticMarkup } = await import('react-dom/server')

    let output: string | undefined
    expect(() => {
      output = renderToStaticMarkup(React.createElement(PDFDocument, { data: emptyFormData }))
    }).not.toThrow()

    expect(output).toBeDefined()

    // D-03: campos vazios devem exibir '—'
    const allText = capturedTexts.join(' ')
    expect(allText).toContain('—')
  })

  it('a saida contém o texto "Classificação de Prontidão" (página final presente)', async () => {
    capturedTexts.length = 0

    const { renderToStaticMarkup } = await import('react-dom/server')

    expect(() => {
      renderToStaticMarkup(React.createElement(PDFDocument, { data: completeData }))
    }).not.toThrow()

    const allText = capturedTexts.join(' ')
    expect(allText).toContain('Classificação de Prontidão')
  })
})
