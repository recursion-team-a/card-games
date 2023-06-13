import { render, screen } from '@testing-library/react'
import { games } from '@/app/games'
import Rules from '@/components/Rules'
import '@testing-library/jest-dom'

describe('Blackjack Rules', () => {
  it('check rules content', () => {
    render(<Rules game={games[1]} />)

    const heading = screen.getByRole('heading')
    const headerText = 'BLACKJACK'
    expect(heading).toHaveTextContent(headerText)
  })
})
