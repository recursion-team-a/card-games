import Player from '../common/Player'
import { HAND_RANK, HAND_RANK_MAP, RANK_CHOICES } from '@/model/poker/handRank'

export default class PokerPlayer extends Player {
  private suits: string[]

  private ranks: number[]

  constructor(name: string, playerType: string, gameStatus: string) {
    super(name, playerType)
    this.suits = this.hand.map((card) => card.suit)
    this.ranks = this.hand.map((card) => card.getRankNumber('poker')).sort((a, b) => a - b)
    this.gameStatus = gameStatus
  }

  public getHandScore(): number {
    return this.hand.length
  }

  public getRanks(): number[] {
    const ranks: number[] = this.hand
      .map((card) =>
        RANK_CHOICES.indexOf(
          card.rank as 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K',
        ),
      )
      .sort((a, b) => a - b)

    return ranks
  }

  public getHandRank(): number {
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
}
