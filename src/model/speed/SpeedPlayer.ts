import Player from '@/model/common/Player'

export default class SpeedPlayer extends Player {
  public getHandScore(): number {
    return this.hand.length
  }
}
