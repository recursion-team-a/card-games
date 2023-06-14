/* eslint no-underscore-dangle:0 */

export default class Card {
  readonly p_suit: string

  readonly p_rank: string

  constructor(suit: string, rank: string) {
    this.p_suit = suit
    this.p_rank = rank
  }

  get suit(): string {
    return this.p_suit
  }

  get rank(): string {
    return this.p_rank
  }

  // カードのゲームごとの強さを整数で返す
  getRankNumber(gameType: string): number {
    let rankToNumber
    switch (gameType) {
      case 'blackjack':
        rankToNumber = {
          A: 11,
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': 6,
          '7': 7,
          '8': 8,
          '9': 9,
          '10': 10,
          J: 10,
          Q: 10,
          K: 10,
        }
        break
      case 'war':
        rankToNumber = {
          A: 14,
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': 6,
          '7': 7,
          '8': 8,
          '9': 9,
          '10': 10,
          J: 11,
          Q: 12,
          K: 13,
        }
        break
      case 'poker':
        rankToNumber = {
          A: 0,
          '2': 1,
          '3': 2,
          '4': 3,
          '5': 4,
          '6': 5,
          '7': 6,
          '8': 7,
          '9': 8,
          '10': 9,
          J: 10,
          Q: 11,
          K: 12,
        }
        break
      default:
        rankToNumber = {
          A: 1,
          '2': 2,
          '3': 3,
          '4': 4,
          '5': 5,
          '6': 6,
          '7': 7,
          '8': 8,
          '9': 9,
          '10': 10,
          J: 11,
          Q: 12,
          K: 13,
        }
        break
    }
    return rankToNumber[this.p_rank] ?? 0 // if runktoNumber[this.rank] is undefined, the function returns 0
  }
}
