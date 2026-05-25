import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { TextareaField } from './textarea-field'

type TestForm = { notes: string }

function Wrapper({ error, helpText }: { error?: string; helpText?: string }) {
  const { control } = useForm<TestForm>()
  return (
    <TextareaField name="notes" control={control} label="Notes" helpText={helpText} error={error} />
  )
}

describe('TextareaField', () => {
  it('renders the textarea element', () => {
    render(<Wrapper />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('shows helpText when there is no error', () => {
    render(<Wrapper helpText="Enter your notes here" />)
    expect(screen.getByText('Enter your notes here')).toBeInTheDocument()
  })

  it('hides helpText and shows error message when error is present', () => {
    render(<Wrapper helpText="Enter your notes here" error="This field is required" />)
    // Error message must be shown (may appear in base component and outer paragraph)
    expect(screen.getAllByText('This field is required').length).toBeGreaterThanOrEqual(1)
    // helpText must NOT be shown (error takes priority)
    expect(screen.queryByText('Enter your notes here')).not.toBeInTheDocument()
  })

  it('shows error message when error is present and no helpText', () => {
    render(<Wrapper error="Too short" />)
    expect(screen.getAllByText('Too short').length).toBeGreaterThanOrEqual(1)
  })

  it('shows neither helpText nor error when both are absent', () => {
    render(<Wrapper />)
    expect(screen.queryByText('Enter your notes here')).not.toBeInTheDocument()
  })
})
