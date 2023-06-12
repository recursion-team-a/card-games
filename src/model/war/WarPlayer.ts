import GameDecision from '../common/GameDesicion'
import Player from '../common/Player'

export default class WarPlayer extends Player {
  promptPlayer(): GameDecision {
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
}
