import Deck from '../common/Deck'
import GameDescision from '../common/GameDesicion'
import Table from '../common/Table'
import BlackjackPlayer from './BlackjackPlayer'

export default class BlackJackTable extends Table {
  protected players: Array<BlackjackPlayer> = []
  protected deck: Deck = new Deck('Blackjack')

  // playerのhandにpushするには、this.deck.drawOne()の戻り値がCardのみでなくてはならない
  // BlackjackPlayerクラスにaddHandメソッドを追加
  public assignPlayerHands(): void {
    for (let i = 0; i < 2; i++) {
      for (let player of this.players) {
        player.addHand(this.deck.drawOne())
      }
    }
  }

  // PlayerクラスにinitializeHandAndBetメソッドを追加
  public clearPlayerHandsAndBet(): void {
    for (let player of this.players) {
      player.initializeHandAndBet()
    }
  }

  public evaluateMove(player: BlackjackPlayer): void {
    let gameDescision: GameDescision = player.promptPlayer()
    if (gameDescision.action === 'hit') {
      player.addHand(this.deck.drawOne())
      if (player.getHandScore() > 21) player.gameStatus = 'butst'
    }
    if (gameDescision.action === 'bet') player.bet += gameDescision.amount
  }

  public getTurnPlayer(): BlackjackPlayer {
    return this.players[this.turnCounter % this.playersSize]
  }

  public haveTurn(): void {
    let currentPlayer: BlackjackPlayer = this.getTurnPlayer()
    if (this.gamePhase === 'betting') {
      this.evaluateMove(currentPlayer)
      if (this.isLastPlayer(currentPlayer)) this.gamePhase = 'acting'
    } else if (this.gamePhase === 'acting') {
      while (!this.isAllPlayerActionResolved()) {
        this.evaluateMove(currentPlayer)
      }
      if (this.isLastPlayer(currentPlayer)) this.gamePhase = 'evaluatingWinner'
    } else if (this.gamePhase === 'evaluatingWinner') {
      this.evaluateAndGetRoundResults()
      this.clearPlayerHandsAndBet()
      this.gamePhase = 'roundOver'
    } else if (this.gamePhase === 'roundOver') {
      this.gamePhase = 'endOfGame'
    }
    this.turnCounter += 1
  }

  public evaluateAndGetRoundResults(): string {}

  public isBlackJack(player: BlackjackPlayer): boolean {
    return player.hand.length == 2 && player.getHandScore() === 21
  }

  public isAllPlayerActionResolved(): boolean {
    let resolved: boolean = true
    for (let player of this.players) {
      if (['broken', 'bust', 'stand'].findIndex((status) => player.gameStatus === status) === -1)
        resolved = false
    }
    return resolved
  }
}
