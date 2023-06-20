import Card from '@/model/common/Card'
import Deck from '@/model/common/Deck'
import Player from '@/model/common/Player'
import Table from '@/model/common/Table'
import WarPlayer from '@/model/war/WarPlayer'

export default class WarTable extends Table {
  protected deck: Deck = new Deck('War')

  protected p_players: Array<WarPlayer> = []

  // 台札
  private p_player1Lead: Array<Card> = []

  private p_player2Lead: Array<Card> = []

  constructor(gamePhase: string) {
    super(gamePhase)
    this.players.push(new WarPlayer('A', 'WarPlayer'))
    this.players.push(new WarPlayer('B', 'WarPlayer'))
  }

  get players(): Array<WarPlayer> {
    return this.p_players
  }

  get player1() {
    return this.players[0]
  }

  get player2() {
    return this.players[1]
  }

  set player1Lead(card: Card | undefined) {
    if (card === undefined) return
    this.p_player1Lead.push(card)
  }

  get player1Lead(): Array<Card> {
    return this.p_player1Lead
  }

  get player2Lead(): Array<Card> {
    return this.p_player2Lead
  }

  set player2Lead(card: Card | undefined) {
    if (card === undefined) return
    this.p_player2Lead.push(card)
  }

  // ゲームの初めにプレイヤーへ手札を割り振る
  public assignPlayerHands(): void {
    const halfOfDeck: number = this.deck.getDeckSize() / 2
    for (let i = 0; i < halfOfDeck; i += 1) {
      this.player1.addHand(this.deck.drawOne())
    }
    for (let i = 0; i < halfOfDeck; i += 1) {
      this.player2.addHand(this.deck.drawOne())
    }
  }

  // プレイヤーの手札とベットに加えて獲得した手札も初期化する
  public clearPlayerHandsAndBet() {
    for (let i = 0; i < this.playersSize; i += 1) {
      this.players[i].initializeHandAndBet()
      this.players[i].clearObtainedCards()
    }
  }

  public getTurnPlayer(): WarPlayer {
    return this.players[this.turnCounter % 2]
  }

  // 勝敗がつかない場合は、さらに札を出す
  public evaluateMove(): void {
    const player1Score = WarPlayer.calculateLeadCardScore(this.player1Lead)
    const player2Score = WarPlayer.calculateLeadCardScore(this.player2Lead)
    if (player1Score > player2Score)
      this.player1.obtainedCards.push(...this.player1Lead, ...this.player2Lead)
    else if (player1Score < player2Score)
      this.player2.obtainedCards.push(...this.player1Lead, ...this.player2Lead)
  }

  public haveTurn(): void {
    if (this.gamePhase === 'battle') {
      this.player1Lead = this.player1.hand.pop()
      this.player2Lead = this.player2.hand.pop()
      this.evaluateMove()
      if (this.player1.hand.length <= 0) this.gamePhase = 'evaluating'
    }
  }

  // 獲得した手札から勝者を判定する
  public evaluateAndGetRoundResults(): Player[] {
    if (this.players[0].obtainedCards.length === this.players[1].obtainedCards.length)
      return this.players

    if (this.players[0].obtainedCards.length > this.players[1].obtainedCards.length)
      return [this.players[0]]
    return [this.players[1]]
  }

  public isLastPlayer(player: WarPlayer): boolean {
    return player === this.players[this.playersSize - 1]
  }
}
