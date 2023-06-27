import Card from '@/model/common/CardImage'

export default class SpeedPlayer {
  readonly p_name: string

  readonly p_playerType: string

  private p_chips: number

  private p_bet: number

  private p_winAmount: number

  private p_gameStatus: string

  public hand: Array<Card> = []

  /*
        String name : プレイヤーの名前
        String playerType : プレイヤータイプ. {'ai', 'user', 'house'}から選択.
        ?Number chips : ゲーム開始に必要なチップ。デフォルトは400
        Number bet : ゲームに賭ける金額
        winAmount : ゲームごとの勝ち負け金額
        gameStatus : ゲームの状態 {'betting', 'acting'}
    */
  constructor(name: string, playerType: string, chips = 400) {
    this.p_name = name
    this.p_playerType = playerType
    this.p_chips = chips
    this.p_bet = 0
    this.p_winAmount = 0
    this.p_gameStatus = 'bet'
  }

  get name(): string {
    return this.p_name
  }

  get playerType(): string {
    return this.p_playerType
  }

  get chips(): number {
    return this.p_chips
  }

  set chips(chips: number) {
    this.p_chips = chips
  }

  get bet(): number {
    return this.p_bet
  }

  set bet(bet: number) {
    this.p_bet = bet
  }

  get winAmount(): number {
    return this.p_winAmount
  }

  set winAmount(winAmount: number) {
    this.p_winAmount = winAmount
  }

  get gameStatus(): string {
    return this.p_gameStatus
  }

  set gameStatus(gameStatus: string) {
    this.p_gameStatus = gameStatus
  }

  public initializeHandAndBet(): void {
    this.bet = 0
    this.hand = []
  }

  public addHand(card: Card | undefined): void {
    if (card instanceof Card) this.hand.push(card)
  }

  public getHandScore(): number {
    return this.hand.length
  }

  public removeCard(card: Card): void {
    for (let i = 0; i < this.hand.length; i += 1) {
      if (this.hand[i].suit === card.suit && this.hand[i].rank === card.rank) {
        this.hand.splice(i, 1)
      }
    }
  }
}
