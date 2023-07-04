import Card from '@/Phaser/common/CardImage'
import Player from '@/model/common/Player'
import { HAND_RANK, HAND_RANK_MAP, RANK_CHOICES, RANK_CHOICES_TEXAS } from '@/model/poker/handRank'

export default class TexasHoldemPlayer extends Player {
  constructor(name: string, playerType: string, gameStatus: string) {
    super(name, playerType)
    this.gameStatus = gameStatus
  }

  public getHandScore(): number {
    return this.hand.length
  }

  public static getRanks(cards: Card[], rankChoices: string[]): number[] {
    const ranks: number[] = cards
      .map((card) =>
        rankChoices.indexOf(
          card.rank as 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K',
        ),
      )
      .sort((a, b) => a - b)

    return ranks
  }

  public findBestHand(communityCards: Card[]): Card[] {
    const cards = [...this.hand, ...communityCards]
    const allCombinations = this.getAllCombinations(cards, 5)
    let bestCards = cards.slice(0, 4)
    let bestStrength = -1
    let bestHighRank = TexasHoldemPlayer.getRanks(bestCards, RANK_CHOICES_TEXAS).reduce(
      (a, b) => a + b,
      0,
    )

    allCombinations.forEach((combination) => {
      const tempCards = combination
      const strength = TexasHoldemPlayer.getCardsRank(tempCards)
      const highRank = TexasHoldemPlayer.getRanks(tempCards, RANK_CHOICES_TEXAS).reduce(
        (a, b) => a + b,
        0,
      )
      if (strength > bestStrength || (strength === bestStrength && highRank > bestHighRank)) {
        bestStrength = strength
        bestCards = tempCards
        bestHighRank = highRank
      }
    })

    return bestCards
  }

  public getAllCombinations(cards: Card[], combinationLength: number): Card[][] {
    if (combinationLength === 0) {
      return [[]]
    }
    if (cards.length === combinationLength) {
      return [cards]
    }
    if (cards.length < combinationLength) {
      return []
    }

    const withoutFirst = this.getAllCombinations(cards.slice(1), combinationLength)
    const withFirst = this.getAllCombinations(cards.slice(1), combinationLength - 1).map(
      (combination) => [cards[0], ...combination],
    )

    return [...withoutFirst, ...withFirst]
  }

  public static findPair(ranks: number[]): [number | null, number[]] {
    const sortedRanks = [...ranks].sort((a, b) => a - b) // sort the ranks
    let pair: number | null = null
    const newRanks: number[] = []

    for (let i = 0; i < sortedRanks.length; i += 1) {
      if (sortedRanks[i] === sortedRanks[i + 1]) {
        pair = sortedRanks[i]
        i += 1 // skip the next rank
      } else {
        newRanks.push(sortedRanks[i])
      }
    }

    return [pair, newRanks]
  }

  public static getCardsRank(cards: Card[]): number {
    const ranks = TexasHoldemPlayer.getRanks(cards, RANK_CHOICES)

    // フラッシュ
    const isFlush = cards.every((card) => card.suit === cards[0].suit)

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
