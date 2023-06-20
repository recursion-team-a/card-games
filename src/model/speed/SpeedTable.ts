/* eslint no-param-reassign: ["error", { "props": false }] */

import Card from '../common/Card'
import Deck from '../common/Deck'
import Table from '../common/Table'
import SpeedPlayer from './SpeedPlayer'

export default class SpeedTable extends Table {
  public players: Array<SpeedPlayer> = []

  protected deck: Deck = new Deck() // 必要？

  public leadCards: Array<Card> = []

  constructor(gamePhase: string) {
    super(gamePhase)
    this.players = [new SpeedPlayer('A', 'user'), new SpeedPlayer('B', 'house')]
  }

  // playerのhandにpushするには、this.deck.drawOne()の戻り値がCardのみでなくてはならない
  public assignPlayerHands(): void {
    for (let i = 0; i < this.playersSize; i += 1) {
      for (let j = 0; j < 4; j += 1) {
        this.players[i].addHand(this.players[i].playerDeck.drawOne())
      }
    }
  }

  // PlayerクラスにinitializeHandAndBetメソッドを追加
  public clearPlayerHandsAndBet(): void {
    for (let i = 0; i < this.playersSize; i += 1) {
      this.players[i].initializeHandAndBet()
    }
  }
}
