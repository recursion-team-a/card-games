import Deck from '../common/Deck'
import GameDecision from '../common/GameDecision'
import Player from '../common/Player'

export default class SpeedPlayer extends Player {
  public playerDeck: Deck

  constructor(name: string, playerType: string, chips = 400) {
    super(name, playerType, chips)
    this.playerDeck = new Deck('speed', this.playerType)
  }

  promptPlayer(): GameDecision {
    return new GameDecision('Under development', this.bet)
  }

  getHandScore(): number {
    return this.hand.length
  }
}
