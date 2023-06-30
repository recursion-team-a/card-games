import Card from '@/model/common/CardImage'
import Player from '@/model/common/Player'

export default class SpeedPlayer extends Player {
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
