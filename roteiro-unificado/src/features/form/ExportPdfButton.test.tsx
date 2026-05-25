/**
 * Scaffold Wave 0 — testes do ExportPdfButton.
 * O componente ExportPdfButton será implementado no Plan 10-02.
 * Os testes completos serão implementados no Plan 10-03 (Wave 2).
 */
import { describe, it } from 'vitest'

describe('ExportPdfButton', () => {
  it.todo('botão só aparece em versões com status "submitted"')
  it.todo('estado IDLE exibe label "Exportar PDF vX"')
  it.todo('estado LOADING exibe spinner e aria-label acessível')
  it.todo('estado ERROR exibe mensagem de erro e permite nova tentativa')
  it.todo('aria-label inclui o número da versão da avaliação')
  it.todo('dispara generateAndOpenPDF ao clicar com dados corretos')
})
