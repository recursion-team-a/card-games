import Card from '@/Phaser/common/CardImage'

export default abstract class Player {
  private p_name: string

  private p_playerType: string

  private p_chips: number

  private p_bet: number

  private p_winAmount: number

  private p_gameStatus: string

  private p_hand: Array<Card> = []

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

  get hand(): Array<Card> {
    return this.p_hand
  }

  set hand(card: Card) {
    this.p_hand.push(card)
  }

  abstract getHandScore(): number

  public initializeHandAndBet(): void {
    this.bet = 0
    this.hand = <any>[]
  }

  public addHand(card: Card | undefined): void {
    if (card instanceof Card) this.hand.push(card)
  }

  public addBet(bet: number) {
    this.bet += bet
  }

  public clearBet() {
    this.bet = 0
  }

  public clearHand() {
    this.hand.length = 0
  }

  public removeCardFromHand(card: Card): void {
    for (let i = 0; i < this.hand.length; i += 1) {
      if (this.hand[i].suit === card.suit && this.hand[i].rank === card.rank) {
        this.hand.splice(i, 1)
      }
    }
  }
}
