import { render, screen } from '@testing-library/react'
import { AutosaveIndicator } from './AutosaveIndicator'

describe('AutosaveIndicator', () => {
  it('Test 1: com lastSaved={null} e isSaving={false}, renderiza "Não salvo"', () => {
    render(<AutosaveIndicator lastSaved={null} isSaving={false} />)
    expect(screen.getByText('Não salvo')).toBeInTheDocument()
  })

  it('Test 2: com isSaving={true}, renderiza "Salvando..."', () => {
    render(<AutosaveIndicator lastSaved={null} isSaving={true} />)
    expect(screen.getByText('Salvando...')).toBeInTheDocument()
  })

  it('Test 3: com lastSaved e isSaving={false}, renderiza "Salvo há X min" e ponto verde', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60_000)
    const { container } = render(<AutosaveIndicator lastSaved={fiveMinutesAgo} isSaving={false} />)
    expect(screen.getByText(/Salvo há/)).toBeInTheDocument()
    expect(screen.getByText(/5 min/)).toBeInTheDocument()
    const greenDot = container.querySelector('.bg-g5')
    expect(greenDot).not.toBeNull()
  })

  it('Test 4: com error={true}, renderiza "Falha ao salvar"', () => {
    render(<AutosaveIndicator lastSaved={null} error={true} />)
    expect(screen.getByText('Falha ao salvar')).toBeInTheDocument()
  })
})
