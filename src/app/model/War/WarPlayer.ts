import GameDecision from '../common/gameDesicion'
import Player from '../common/player'

export default class WarPlayer extends Player {
  promptPlayer(userData: number | null): GameDecision {
    let action = ''
    return new GameDecision(action, this.bet)
  }

  getHandScore(): number {
    let handScore = 0
    for (let i = 0; i < this.hand.length; i++) {
      handScore += this.hand[i].getRankNumber('blackjack')
    }

    return handScore
  }
}
