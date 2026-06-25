import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { SessionPage } from './SessionPage'

describe('SessionPage', () => {
  it('mounts with templates, phase config, and a timeline', () => {
    render(
      <MemoryRouter>
        <SessionPage />
      </MemoryRouter>,
    )
    expect(
      screen.getByRole('heading', { name: /Session Builder/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Deep Programming/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Main block/i })).toBeInTheDocument()
    // Induction type options render as radios.
    expect(screen.getByRole('radio', { name: /PMR/i })).toBeInTheDocument()
  })
})
