/**
 * Scaffold Wave 0 — testes do entry imperativo generateAndOpenPDF.
 * Os testes completos serão implementados no Plan 10-03 (Wave 2).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock do módulo supabase para evitar dependência de env vars
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'test-id',
              version: 1,
              form_data: {},
              readiness_level_mgmt: 'G3',
              readiness_level_tech: 'G2',
              submitted_at: new Date().toISOString(),
            },
            error: null,
          }),
        }),
      }),
    }),
  },
}))

// Mock do chunk pdf — evita importar @react-pdf/renderer no ambiente de teste
vi.mock('@react-pdf/renderer', () => ({
  pdf: vi.fn().mockReturnValue({
    toBlob: vi.fn().mockResolvedValue(new Blob(['%PDF-1.4'], { type: 'application/pdf' })),
  }),
  Document: ({ children }: { children: unknown }) => children,
  Page: ({ children }: { children: unknown }) => children,
  Text: ({ children }: { children: unknown }) => children,
  StyleSheet: { create: (s: unknown) => s },
}))

describe('generateAndOpenPDF', () => {
  beforeEach(() => {
    // Mock window.open e métodos específicos de URL (sem substituir a classe inteira)
    vi.stubGlobal('open', vi.fn())
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url')
    vi.spyOn(URL, 'revokeObjectURL').mockReturnValue(undefined)
  })

  it('chama window.open com _blank após gerar o blob', async () => {
    const { generateAndOpenPDF } = await import('./index')

    await generateAndOpenPDF({
      assessmentId: 'test-id',
      version: 1,
      orgName: 'Construtora Teste',
      cnpj: '00.000.000/0001-00',
      grade: 'G3',
    })

    expect(window.open).toHaveBeenCalledWith('blob:test-url', '_blank')
  })

  it.todo('lança Error quando supabase retorna error')
  it.todo('lança Error quando supabase retorna data null')
  it.todo('revoga o URL do blob após 60 segundos')
})
