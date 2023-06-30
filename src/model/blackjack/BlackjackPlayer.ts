import Player from '@/model/common/Player'

export default class BlackjackPlayer extends Player {
  /*
      return Number : 手札の合計
      合計が21を超える場合、手札の各エースについて、合計が21以下になるまで10を引きます。
    */
  public getHandScore(): number {
    let handScore = 0
    let numbersOfAces = 0

    for (let i = 0; i < this.hand.length; i += 1) {
      if (this.hand[i].rank === 'A') numbersOfAces += 1
      handScore += this.hand[i].getRankNumber('blackjack')
    }

    // 21を超える場合は21以下になるまで, Aを1としてカウント.
    if (handScore > 21) {
      while (handScore > 21 && numbersOfAces > 0) {
        handScore -= 10
        numbersOfAces -= 1
      }
    }
    return handScore
  }
}
