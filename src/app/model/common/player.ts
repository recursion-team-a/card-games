import Card from './card'
import GameDecision from './gameDesicion'

export default abstract class Player {
  name: string
  playerType: string
  chips: number
  bet: number
  winAmount: number
  gameStatus: string
  hand: Array<Card> = []
  /*
        String name : プレイヤーの名前
        String playerType : プレイヤータイプ. {'ai', 'user', 'house'}から選択.
        ?Number chips : ゲーム開始に必要なチップ。デフォルトは400
        Number bet : ゲームに賭ける金額
        winAmount : ゲームごとの勝ち負け金額
        gameStatus : ゲームの状態 {'betting', 'acting'}
    */
  constructor(name: string, playerType: string, chips = 400) {
    this.name = name
    this.playerType = playerType
    this.chips = chips
    this.bet = 0
    this.winAmount = 0
    this.gameStatus = 'bet'
  }

  abstract promptPlayer(userData: number): GameDecision

  abstract getHandScore(): number
}
