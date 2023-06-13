import Card from './Card'
import GameDecision from './GameDesicion'

export default abstract class Player {
  readonly _name: string

  readonly _playerType: string

  private _chips: number

  private _bet: number

  private _winAmount: number

  private _gameStatus: string

  private _hand: Array<Card> = []

  /*
        String name : プレイヤーの名前
        String playerType : プレイヤータイプ. {'ai', 'user', 'house'}から選択.
        ?Number chips : ゲーム開始に必要なチップ。デフォルトは400
        Number bet : ゲームに賭ける金額
        winAmount : ゲームごとの勝ち負け金額
        gameStatus : ゲームの状態 {'betting', 'acting'}
    */
  constructor(name: string, playerType: string, chips = 400) {
    this._name = name
    this._playerType = playerType
    this._chips = chips
    this._bet = 0
    this._winAmount = 0
    this._gameStatus = 'bet'
  }

  get name(): string {
    return this._name
  }

  get playerType(): string {
    return this._playerType
  }

  get chips(): number {
    return this._chips
  }

  set chips(chips: number) {
    this._chips = chips
  }

  get bet(): number {
    return this._bet
  }

  set bet(bet: number) {
    this._bet = bet
  }

  get winAmount(): number {
    return this._winAmount
  }

  set winAmount(winAmount: number) {
    this._winAmount = winAmount
  }

  get gameStatus(): string {
    return this._gameStatus
  }

  set gameStatus(gameStatus: string) {
    this._gameStatus = gameStatus
  }

  get hand(): Array<Card> {
    return this._hand
  }

  abstract promptPlayer(): GameDecision

  abstract getHandScore(): number
}
