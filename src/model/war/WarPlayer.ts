import Card from '@/model/common/Card'
import Player from '@/model/common/Player'

export default class WarPlayer extends Player {
  private p_obtainedCards: Array<Card> = []

  set obtainedCards(obtainedCard: Card) {
    this.p_obtainedCards.push(obtainedCard)
  }

  get obtainedCards(): Array<Card> {
    return this.p_obtainedCards
  }

  public addHand(card: Card | undefined): void {
    if (card instanceof Card) this.hand.push(card)
  }

  public clearObtainedCards() {
    this.obtainedCards = <any>[]
  }

  promptPlayer() {
    this.gameStatus = 'acting'
    throw new Error('Method not implemented!')
  }

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
