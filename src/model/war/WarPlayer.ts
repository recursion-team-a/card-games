import Card from '../common/Card'
import GameDecision from '../common/GameDesicion'
import Player from '../common/Player'

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

  promptPlayer(): GameDecision {
    this.gameStatus = 'acting'
    throw new Error('Method not implemented!')
  }

  public static calculateLeadCardScore(cards: Array<Card>) {
    let score = 0
    for (let i = 0; i < cards.length; i += 1) {
      score += cards[i].getRankNumber('war')
    }
    return score
  }

  getHandScore(): number {
    let handScore = 0
    for (let i = 0; i < this.hand.length; i += 1) {
      handScore += this.hand[i].getRankNumber('war')
    }

    return handScore
  }
}
