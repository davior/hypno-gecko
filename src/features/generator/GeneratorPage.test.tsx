import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { GeneratorPage } from './GeneratorPage'

describe('GeneratorPage', () => {
  it('mounts the full control tree', () => {
    render(
      <MemoryRouter>
        <GeneratorPage />
      </MemoryRouter>,
    )
    expect(
      screen.getByRole('heading', { name: /Frequency & Beat Generator/i }),
    ).toBeInTheDocument()
    // Method selector renders the four entrainment methods as radios.
    expect(
      screen.getByRole('radio', { name: /Isochronic/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Binaural/i })).toBeInTheDocument()
    // Transport exposes a play control.
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
  })
})
