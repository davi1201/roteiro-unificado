import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { SelectField } from './select-field'

type TestForm = { choice: string }

function Wrapper({
  error,
  options = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
  ],
}: {
  error?: string
  options?: Array<{ value: string; label: string }>
}) {
  const { control } = useForm<TestForm>()
  return (
    <SelectField
      name="choice"
      control={control}
      label="My Select"
      options={options}
      error={error}
    />
  )
}

describe('SelectField', () => {
  it('renders all provided options in the select element', () => {
    render(<Wrapper />)
    expect(screen.getByRole('option', { name: 'Option A' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Option B' })).toBeInTheDocument()
  })

  it('renders the label text', () => {
    render(<Wrapper />)
    expect(screen.getByText('My Select')).toBeInTheDocument()
  })

  it('propagates error message to the base Select and shows error paragraph', () => {
    render(<Wrapper error="Field is required" />)
    // Error message rendered in the outer paragraph (SelectField's own <p>) AND
    // also inside the base Select component — both show the message
    const errorMessages = screen.getAllByText('Field is required')
    expect(errorMessages.length).toBeGreaterThanOrEqual(1)
    // The select element receives error styling (border-g1 class from the base Select)
    const select = screen.getByRole('combobox')
    expect(select.className).toMatch(/border-g1/)
  })

  it('does not render an error paragraph when no error is passed', () => {
    render(<Wrapper />)
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
  })
})
