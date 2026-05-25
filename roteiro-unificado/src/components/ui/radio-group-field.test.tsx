import { render, screen, fireEvent } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { RadioGroupField } from './radio-group-field'

type TestForm = { pick: string }

const OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
]

function Wrapper({ defaultValue }: { defaultValue?: string }) {
  const { control } = useForm<TestForm>({ defaultValues: { pick: defaultValue } })
  return <RadioGroupField name="pick" control={control} label="Pick one" options={OPTIONS} />
}

describe('RadioGroupField', () => {
  it('renders options as type="button" buttons (not input[type=radio])', () => {
    render(<Wrapper />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(OPTIONS.length)
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute('type', 'button')
    })
  })

  it('applies selected styles ring-2 ring-primary bg-primary/10 text-primary font-medium on selected option', () => {
    render(<Wrapper defaultValue="yes" />)
    const selectedBtn = screen.getByRole('button', { name: 'Yes' })
    // The className must include the selected state tokens
    expect(selectedBtn.className).toMatch(/ring-2/)
    expect(selectedBtn.className).toMatch(/ring-primary/)
    expect(selectedBtn.className).toMatch(/bg-primary\/10/)
    expect(selectedBtn.className).toMatch(/text-primary/)
    expect(selectedBtn.className).toMatch(/font-medium/)
  })

  it('does NOT apply selected styles to unselected option', () => {
    render(<Wrapper defaultValue="yes" />)
    const unselectedBtn = screen.getByRole('button', { name: 'No' })
    expect(unselectedBtn.className).not.toMatch(/ring-2/)
  })

  it('calls field.onChange with correct value when button is clicked', () => {
    function ControlledWrapper() {
      const { control, watch } = useForm<TestForm>({ defaultValues: { pick: '' } })
      const value = watch('pick')
      return (
        <>
          <RadioGroupField name="pick" control={control} label="Pick one" options={OPTIONS} />
          <span data-testid="current-value">{value}</span>
        </>
      )
    }
    render(<ControlledWrapper />)
    fireEvent.click(screen.getByRole('button', { name: 'No' }))
    expect(screen.getByTestId('current-value').textContent).toBe('no')
  })
})
