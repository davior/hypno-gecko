import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AffirmationsPage } from './AffirmationsPage'

describe('AffirmationsPage', () => {
  it('mounts with the seeded library and delivery controls', () => {
    render(
      <MemoryRouter>
        <AffirmationsPage />
      </MemoryRouter>,
    )
    expect(
      screen.getByRole('heading', { name: /Affirmation Engine/i }),
    ).toBeInTheDocument()
    // Seeded starter library is listed.
    expect(screen.getByText('Quiet Confidence')).toBeInTheDocument()
    // Delivery sequencing options are present.
    expect(screen.getByRole('radio', { name: /Weighted/i })).toBeInTheDocument()
  })
})
