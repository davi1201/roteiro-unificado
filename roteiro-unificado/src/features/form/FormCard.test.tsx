import { render, screen } from '@testing-library/react'
import { FormCard } from './FormCard'

describe('FormCard', () => {
  it('Test 1: renderiza title no header e children no body', () => {
    render(
      <FormCard icon={<span>X</span>} iconColor="blue" title="Meu Card">
        <p>Conteúdo do card</p>
      </FormCard>
    )
    expect(screen.getByText('Meu Card')).toBeDefined()
    expect(screen.getByText('Conteúdo do card')).toBeDefined()
  })

  it('Test 2: renderiza subtitle quando passado, não renderiza quando ausente', () => {
    const { rerender, container } = render(
      <FormCard icon={<span>X</span>} iconColor="blue" title="Card" subtitle="Subtítulo aqui">
        <div />
      </FormCard>
    )
    expect(screen.getByText('Subtítulo aqui')).toBeDefined()

    rerender(
      <FormCard icon={<span>X</span>} iconColor="blue" title="Card">
        <div />
      </FormCard>
    )
    expect(
      container.querySelector('[data-testid="subtitle"]') ?? screen.queryByText('Subtítulo aqui')
    ).toBeNull()
  })

  it('Test 3: com iconColor="blue", ícone está em elemento com classe bg-primary', () => {
    const { container } = render(
      <FormCard icon={<span>icon</span>} iconColor="blue" title="Card">
        <div />
      </FormCard>
    )
    const el = container.querySelector('.bg-primary')
    expect(el).not.toBeNull()
  })

  it('Test 4: com iconColor="amber", ícone está em elemento com classe bg-accent', () => {
    const { container } = render(
      <FormCard icon={<span>icon</span>} iconColor="amber" title="Card">
        <div />
      </FormCard>
    )
    const el = container.querySelector('.bg-accent')
    expect(el).not.toBeNull()
  })

  it('Test 5: com iconColor="green", ícone está em elemento com classe bg-g5', () => {
    const { container } = render(
      <FormCard icon={<span>icon</span>} iconColor="green" title="Card">
        <div />
      </FormCard>
    )
    const el = container.querySelector('.bg-g5')
    expect(el).not.toBeNull()
  })

  it('Test 6: com iconColor="purple", ícone está em elemento com background roxo (bg-\\[\\#7c3aed\\])', () => {
    const { container } = render(
      <FormCard icon={<span>icon</span>} iconColor="purple" title="Card">
        <div />
      </FormCard>
    )
    // arbitrary value class name pode ter variações de escape
    const el =
      container.querySelector('.bg-\\[\\#7c3aed\\]') ?? container.querySelector('[class*="7c3aed"]')
    expect(el).not.toBeNull()
  })
})
