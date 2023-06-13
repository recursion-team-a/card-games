import Deck from './Deck'
import Player from './Player'

export default abstract class Table {
  private static _betDominations: Array<number> = [5, 20, 50, 100]

  private p_turnCounter: number

  private p_gamePhase: string

  protected abstract deck: Deck

  protected abstract players: Array<Player>

  constructor(gamePhase: string) {
    this.p_turnCounter = 0
    this.p_gamePhase = gamePhase
  }

  get turnCounter(): number {
    return this.p_turnCounter
  }

  set turnCounter(turnCounter: number) {
    this.p_turnCounter = turnCounter
  }

  get gamePhase(): string {
    return this.p_gamePhase
  }

  set gamePhase(gamePhase: string) {
    this.gamePhase = gamePhase
  }

  get playersSize(): number {
    return this.players.length
  }

  abstract assignPlayerHands(): void

  abstract clearPlayerHandsAndBet(): void

  abstract evaluateMove(player: Player): void

  abstract getTurnPlayer(): void

  abstract haveTurn(): void

  // 勝利したプレイヤーを判定する
  abstract evaluateAndGetRoundResults(): Array<Player>

  public isLastPlayer(player: Player): boolean {
    return this.players.length > 0 && player === this.players[-1]
  }
}
