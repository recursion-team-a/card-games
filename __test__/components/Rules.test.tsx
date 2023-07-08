import { render, screen } from '@testing-library/react'
import games from '@/app/games.json'
import Rules from '@/components/Rules'
import '@testing-library/jest-dom'

describe('Blackjack Rules', () => {
  it('check rules content', () => {
    render(<Rules game={games[1]} />)

    const heading = screen.getByTestId('game-title')
    const headerText = 'BLACKJACK'

    expect(heading).toHaveTextContent(headerText)
  })
})
