import Card from '@/model/common/CardImage'
import Player from '@/model/common/Player'

export default class WarPlayer extends Player {
  getHandScore(): number {
    let handScore = 0
    for (let i = 0; i < this.hand.length; i += 1) {
      handScore += this.hand[i].getRankNumber('war')
    }
    return handScore
  }

  public receiveCardFaceDown(card: Card | undefined): void {
    card?.setFaceDown(true)
    if (card instanceof Card) this.hand.push(card)
  }
}
