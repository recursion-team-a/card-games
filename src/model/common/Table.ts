import Deck from './Deck'
import Player from './Player'

export default abstract class Table {
  private static _betDominations: Array<number> = [5, 20, 50, 100]
  private _resultsLog: Array<string>
  private _turnCounter: number
  private _gamePhase: string
  protected abstract deck: Deck
  protected abstract players: Array<Player>

  constructor(gamePhase: string) {
    this._resultsLog = []
    this._turnCounter = 0
    this._gamePhase = gamePhase
  }

  get resultLog(): Array<string> {
    return this._resultsLog
  }

  set resultLog(resultLog: Array<string>) {
    this._resultsLog = this.resultLog
  }

  get turnCounter(): number {
    return this._turnCounter
  }

  set turnCounter(turnCounter: number) {
    this._turnCounter = turnCounter
  }

  get gamePhase(): string {
    return this._gamePhase
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

  abstract evaluateAndGetRoundResults(): string

  public isLastPlayer(player: Player): boolean {
    return this.players.length > 0 && player === this.players[-1]
  }
}
