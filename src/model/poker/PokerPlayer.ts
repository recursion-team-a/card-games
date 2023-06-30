import Card from '../../Phaser/common/CardImage'
import { HAND_RANK, HAND_RANK_MAP, RANK_CHOICES } from '@/Phaser/poker/constants/handRank'

export default class PokerPlayer {
  private suits: string[]

  private ranks: number[]

  public hand: Array<Card> = []

  private p_gameStatus: string

  public name: string

  public playerType: string

  public p_bet: number = 0

  constructor(name: string, playerType: string, gameStatus: string) {
    this.name = name
    this.playerType = playerType
    this.suits = this.hand.map((card) => card.suit)
    this.ranks = this.hand.map((card) => card.getRankNumber('poker')).sort((a, b) => a - b)
    this.p_gameStatus = gameStatus
  }

  get gameStatus(): string {
    return this.p_gameStatus
  }

  set gameStatus(gameStatus: string) {
    this.p_gameStatus = gameStatus
  }

  get bet(): number {
    return this.p_bet
  }

  set bet(bet: number) {
    this.p_bet = bet
  }

  clearHand() {
    this.hand = []
  }

  getHandScore(): number {
    return this.hand.length
  }

  getRanks(): number[] {
    const ranks: number[] = this.hand
      .map((card) =>
        RANK_CHOICES.indexOf(
          card.rank as 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K',
        ),
      )
      .sort((a, b) => a - b)

    return ranks
  }

  getHandRank(): number {
    const ranks = this.getRanks()

    // フラッシュ
    const isFlush = this.hand.every((card) => card.suit === this.hand[0].suit)

    let isStraight: boolean

    if (ranks[4] === 12 && ranks[0] === 0) {
      // Aを0として扱う場合のストレート
      isStraight = ranks[3] === 11 && ranks[2] === 10 && ranks[1] === 9
    } else {
      // Aを13として扱う場合のストレート
      isStraight = ranks[4] - ranks[0] === 4 && new Set(ranks).size === 5
    }

    const isRoyalStraightFlush = isFlush && isStraight && ranks[0] === 0 && ranks[4] === 12

    // ペア
    const pairs = ranks.filter((rank, i) => rank === ranks[i + 1])

    // フルハウス
    const isFullHouse = pairs.length === 3 && new Set(pairs).size === 2

    if (isRoyalStraightFlush) {
      return HAND_RANK_MAP.get(HAND_RANK.ROYAL_STRAIGHT_FLUSH) as number
    }
    if (isFlush && isStraight) {
      return HAND_RANK_MAP.get(HAND_RANK.STRAIGHT_FLUSH) as number
    }
    if (isFullHouse) {
      return HAND_RANK_MAP.get(HAND_RANK.FULL_HOUSE) as number
    }
    if (pairs.length === 1) {
      return HAND_RANK_MAP.get(HAND_RANK.ONE_PAIR) as number
    }
    if (pairs.length === 2 && new Set(pairs).size === 2) {
      return HAND_RANK_MAP.get(HAND_RANK.TWO_PAIR) as number
    }
    if (pairs.length === 2 && new Set(pairs).size === 1) {
      return HAND_RANK_MAP.get(HAND_RANK.THREE_OF_A_KIND) as number
    }
    if (pairs.length === 3 && new Set(pairs).size === 1) {
      return HAND_RANK_MAP.get(HAND_RANK.FOUR_OF_A_KIND) as number
    }
    if (isFlush) {
      return HAND_RANK_MAP.get(HAND_RANK.FLUSH) as number
    }
    if (isStraight) {
      return HAND_RANK_MAP.get(HAND_RANK.STRAIGHT) as number
    }
    return HAND_RANK_MAP.get(HAND_RANK.HIGH_CARD) as number
  }

  // 各役の判定メソッド
  // ロイヤルストレートフラッシュ(10, 11, 12, 13, 1の5枚でsuitが同じ)
  isRoyalFlush(): boolean {
    return this.isFlush() && this.isStraight() && this.ranks[0] === 10
  }

  public addHand(card: Card | undefined): void {
    if (card instanceof Card) this.hand.push(card)
  }

  public addBet(bet: number) {
    this.bet += bet
  }

  public receiveCardFaceDown(card: Card | undefined): void {
    card?.setFaceUp()
    if (card instanceof Card) this.hand.push(card)
  }

  removeCardFromHand(card: Card): void {
    for (let i = 0; i < this.hand.length; i += 1) {
      if (this.hand[i].suit === card.suit && this.hand[i].rank === card.rank) {
        this.hand.splice(i, 1)
      }
    }
  }

  clearBet() {
    this.bet = 0
  }

  // ストレートフラッシュ
  isStraightFlush(): boolean {
    return this.isFlush() && this.isStraight()
  }

  // フォーカード
  isFourOfAKind(): boolean {
    const rankCounts = this.countRanks()
    return rankCounts.includes(4)
  }

  // フルハウス（同数位のカード3枚とペア）
  isFullHouse(): boolean {
    const rankCounts = this.countRanks()
    return rankCounts.includes(3) && rankCounts.includes(2)
  }

  // フラッシュ(一種類のsuit)
  isFlush(): boolean {
    return new Set(this.suits).size === 1
  }

  // ストレート（5枚のカードの数位が連続・10JQKAはストレート・KA2などは×）
  isStraight(): boolean {
    if (
      this.ranks[0] === 0 &&
      this.ranks[1] === 9 &&
      this.ranks[2] === 10 &&
      this.ranks[3] === 11 &&
      this.ranks[4] === 12
    ) {
      return true
    }
    for (let i = 0; i < 4; i += 1) {
      if (this.ranks[i + 1] - this.ranks[i] !== 1) {
        return false
      }
    }
    return true
  }

  // スリーカード
  isThreeOfAKind(): boolean {
    const rankCounts = this.countRanks()
    return rankCounts.includes(3)
  }

  // ツーペア
  isTwoPair(): boolean {
    const rankCounts = this.countRanks()
    return rankCounts.filter((count) => count === 2).length === 2
  }

  // ワンペア
  isOnePair(): boolean {
    const rankCounts = this.countRanks()
    return rankCounts.includes(2)
  }

  // 各ランクの数を数えます
  countRanks(): number[] {
    const counts: number[] = Array(13).fill(0)
    for (let i = 0; i < this.ranks.length; i += 1) {
      counts[this.ranks[i]] += 1
    }
    return counts
  }
}
