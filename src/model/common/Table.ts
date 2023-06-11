import Deck from './Deck'
import Player from './Player'

export default abstract class Table {
  private betDominations: Array<number> = [5, 20, 50, 100]
  private resultsLog: Array<string> = []
  protected turnCounter: number = 0
  protected abstract gamePhase: Array<string>
  protected abstract deck: Deck
  protected abstract players: Array<Player>

  constructor() {}
  abstract assignPlayerHands(): void
  abstract clearPlayerHandsAndBet(): void
  abstract evaluateMove(player: Player): void
  abstract getTurnPlayer(): void
  abstract haveTurn(): void
  abstract evaluateAndGetRoundResults(): string
  public isLastPlayer(player: Player): boolean {
    return (
      this.players.findIndex((candidate) => candidate.name == player.name) ==
      this.players.length - 1
    )
  }
}
