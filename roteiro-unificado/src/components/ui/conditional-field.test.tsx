import { render, screen, act } from '@testing-library/react'
import { useState } from 'react'
import { ConditionalField } from './conditional-field'

describe('ConditionalField', () => {
  it('renders children when condition=true', () => {
    const unregisterFn = vi.fn()
    render(
      <ConditionalField condition={true} fieldName="myField" unregisterFn={unregisterFn}>
        <span>Child content</span>
      </ConditionalField>
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('renders null (nothing) when condition=false', () => {
    const unregisterFn = vi.fn()
    render(
      <ConditionalField condition={false} fieldName="myField" unregisterFn={unregisterFn}>
        <span>Child content</span>
      </ConditionalField>
    )
    expect(screen.queryByText('Child content')).not.toBeInTheDocument()
  })

  it('calls unregisterFn(fieldName, { keepValue: false }) when condition changes to false', () => {
    const unregisterFn = vi.fn()

    function Toggle() {
      const [show, setShow] = useState(true)
      return (
        <>
          <button onClick={() => setShow(false)}>Hide</button>
          <ConditionalField condition={show} fieldName="qualBI" unregisterFn={unregisterFn}>
            <span>Visible</span>
          </ConditionalField>
        </>
      )
    }

    render(<Toggle />)
    // Initially shown, condition=true — unregisterFn should NOT have been called
    expect(screen.getByText('Visible')).toBeInTheDocument()

    act(() => {
      screen.getByRole('button', { name: 'Hide' }).click()
    })

    expect(screen.queryByText('Visible')).not.toBeInTheDocument()
    expect(unregisterFn).toHaveBeenCalledWith('qualBI', { keepValue: false })
  })

  it('does NOT call unregisterFn when condition stays true on re-render', () => {
    const unregisterFn = vi.fn()
    const { rerender } = render(
      <ConditionalField condition={true} fieldName="myField" unregisterFn={unregisterFn}>
        <span>Child</span>
      </ConditionalField>
    )
    rerender(
      <ConditionalField condition={true} fieldName="myField" unregisterFn={unregisterFn}>
        <span>Child</span>
      </ConditionalField>
    )
    expect(unregisterFn).not.toHaveBeenCalled()
  })
})
