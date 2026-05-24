import { render } from '@testing-library/react'
import { FormCardRow } from './FormCardRow'

describe('FormCardRow', () => {
  it('Test 1: com cols={1} renderiza container com classe grid-cols-1', () => {
    const { container } = render(
      <FormCardRow cols={1}>
        <div>filho</div>
      </FormCardRow>
    )
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('grid-cols-1')
  })

  it('Test 2: com cols={2} renderiza container com classe md:grid-cols-2 (responsivo)', () => {
    const { container } = render(
      <FormCardRow cols={2}>
        <div>A</div>
        <div>B</div>
      </FormCardRow>
    )
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('md:grid-cols-2')
  })

  it('Test 3: renderiza todos os children passados', () => {
    const { container } = render(
      <FormCardRow cols={1}>
        <div id="child-a">A</div>
        <div id="child-b">B</div>
        <div id="child-c">C</div>
      </FormCardRow>
    )
    expect(container.querySelector('#child-a')).not.toBeNull()
    expect(container.querySelector('#child-b')).not.toBeNull()
    expect(container.querySelector('#child-c')).not.toBeNull()
  })
})
