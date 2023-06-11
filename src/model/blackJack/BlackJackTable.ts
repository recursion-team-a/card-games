import Deck from '../common/Deck'
import Player from '../common/Player'
import Table from '../common/Table'

export default class BlackJackTable extends Table {
  protected players: Array<Player> = []
  protected gamePhase: Array<string> = [
    'betting',
    'acting',
    'evaluatingWinner',
    'roundOver',
    'endOfGame',
  ]
  protected deck: Deck = new Deck('Blackjack')
  // playerのhandにpushするには、this.deck.drawOne()の戻り値がCardのみでなくてはならない
  // BlackjackPlayerクラスにaddHandメソッドを追加
  public assignPlayerHands(): void {
    for (let i = 0; i < 2; i++) {
      for (let player of this.players) {
        if (player instanceof BlackjackPlayer) player.addHand(this.deck.drawOne())
      }
    }
  }

  // PlayerクラスにinitializeHandAndBetメソッドを追加
  public clearPlayerHandsAndBet(): void {
    for (let player of this.players) {
      player.initializeHandAndBet()
    }
  }
  public evaluateMove(player: Player): void {}
  public getTurnPlayer(): void {}
  public haveTurn(): void {}
  public evaluateAndGetRoundResults(): string {}
  public isBlackJack(player: Player): boolean {
    return player.getHandScore() === 21
  }
}
