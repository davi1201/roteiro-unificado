import { render, screen, fireEvent } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { CheckboxGroupField } from './checkbox-group-field'

type TestForm = { items: string[] }

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
]

function Wrapper({
  defaultValues,
  showSelectAll,
}: {
  defaultValues?: string[]
  showSelectAll?: boolean
}) {
  const { control, watch } = useForm<TestForm>({
    defaultValues: { items: defaultValues ?? [] },
  })
  const current = watch('items')
  return (
    <>
      <CheckboxGroupField
        name="items"
        control={control}
        label="Items"
        options={OPTIONS}
        showSelectAll={showSelectAll}
      />
      <span data-testid="value">{JSON.stringify(current)}</span>
    </>
  )
}

describe('CheckboxGroupField', () => {
  it('manages a string[] array: selecting a checkbox adds value to array', () => {
    render(<Wrapper />)
    fireEvent.click(screen.getByLabelText('Alpha'))
    expect(JSON.parse(screen.getByTestId('value').textContent!)).toContain('a')
  })

  it('deselecting a checked checkbox removes value from array', () => {
    render(<Wrapper defaultValues={['a', 'b']} />)
    fireEvent.click(screen.getByLabelText('Alpha'))
    const result = JSON.parse(screen.getByTestId('value').textContent!)
    expect(result).not.toContain('a')
    expect(result).toContain('b')
  })

  it('showSelectAll=true renders a master checkbox that selects all options at once', () => {
    render(<Wrapper showSelectAll />)
    const selectAllCheckbox = screen.getByLabelText('Selecionar todos os módulos')
    expect(selectAllCheckbox).toBeInTheDocument()
    fireEvent.click(selectAllCheckbox)
    const result = JSON.parse(screen.getByTestId('value').textContent!)
    expect(result).toEqual(['a', 'b', 'c'])
  })

  it('showSelectAll=false (default) does not render master checkbox', () => {
    render(<Wrapper />)
    expect(screen.queryByLabelText('Selecionar todos os módulos')).not.toBeInTheDocument()
  })

  it('master checkbox deselects all when all are currently selected', () => {
    render(<Wrapper defaultValues={['a', 'b', 'c']} showSelectAll />)
    const selectAllCheckbox = screen.getByLabelText('Selecionar todos os módulos')
    // Should be checked because all 3 are selected
    expect(selectAllCheckbox).toBeChecked()
    fireEvent.click(selectAllCheckbox)
    const result = JSON.parse(screen.getByTestId('value').textContent!)
    expect(result).toEqual([])
  })
})
