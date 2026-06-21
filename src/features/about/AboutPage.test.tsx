import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AboutPage } from './AboutPage'

describe('AboutPage', () => {
  it('renders the vision and the brainwave band table', () => {
    render(<AboutPage />)
    expect(
      screen.getByRole('heading', { name: /About Hypno Gecko/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('Theta')).toBeInTheDocument()
    expect(screen.getByText('Isochronic')).toBeInTheDocument()
  })
})
