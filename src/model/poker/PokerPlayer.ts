import GameDecision from '../common/GameDesicion'
import Player from '../common/Player'

export default class PokerPlayer extends Player {
  private suits: string[]

  private ranks: number[]

  /* 
    _suits: string[] 手札のスートを格納する配列
    _ranks: string[] 手札を番号に変換し,ソートして格納する配列
  */
  constructor(name: string, playerType: string, chips = 400) {
    super(name, playerType, chips)
    this.suits = this.hand.map((card) => card.suit)
    this.ranks = this.hand.map((card) => card.getRankNumber('poker')).sort((a, b) => a - b)
  }

  promptPlayer(): GameDecision {
    return new GameDecision('Under development', this.bet)
  }

  getHandScore(): number {
    return this.hand.length
  }

  getHandRank(): number {
    let num: number = 0
    if (this.isRoyalFlush()) {
      num = 10
    } else if (this.isStraightFlush()) {
      num = 9
    } else if (this.isFourOfAKind()) {
      num = 8
    } else if (this.isFullHouse()) {
      num = 7
    } else if (this.isFlush()) {
      num = 6
    } else if (this.isStraight()) {
      num = 5
    } else if (this.isThreeOfAKind()) {
      num = 4
    } else if (this.isTwoPair()) {
      num = 3
    } else if (this.isOnePair()) {
      num = 2
    } else {
      num = 1
    }
    return num
  }

  // 各役の判定メソッド
  // ロイヤルストレートフラッシュ(10, 11, 12, 13, 1の5枚でsuitが同じ)
  isRoyalFlush(): boolean {
    return this.isFlush() && this.isStraight() && this.ranks[0] === 10
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
