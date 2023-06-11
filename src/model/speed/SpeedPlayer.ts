import GameDecision from '../common/GameDesicion'
import Player from '../common/Player'

export default class SpeedPlayer extends Player {
  promptPlayer(): GameDecision {
    return new GameDecision('Under development', this.bet)
  }

  getHandScore(): number {
    return this.hand.length
  }
}