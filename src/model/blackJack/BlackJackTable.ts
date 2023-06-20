/* eslint no-param-reassign: ["error", { "props": false }] */

import Deck from '../common/Deck'
import GameDecision from '../common/GameDecision'
import Table from '../common/Table'
import BlackjackPlayer from './BlackjackPlayer'

export default class BlackJackTable extends Table {
  public players: Array<BlackjackPlayer> = []

  protected deck: Deck = new Deck('Blackjack')

  constructor(gamePhase: string) {
    super(gamePhase)
    this.players.push(new BlackjackPlayer('A', 'Blackjack'))
    this.players.push(new BlackjackPlayer('B', 'Blackjack'))
  }

  // playerのhandにpushするには、this.deck.drawOne()の戻り値がCardのみでなくてはならない
  // BlackjackPlayerクラスにaddHandメソッドを追加
  public assignPlayerHands(): void {
    for (let i = 0; i < this.playersSize; i += 1) {
      for (let j = 0; j < 2; j += 1) {
        this.players[i].addHand(this.deck.drawOne())
      }
    }
  }

  // PlayerクラスにinitializeHandAndBetメソッドを追加
  public clearPlayerHandsAndBet(): void {
    for (let i = 0; i < this.playersSize; i += 1) {
      this.players[i].initializeHandAndBet()
    }
  }

  // プレイヤーの手札がbustするならgameStatusを変更する
  public static handlePlayerBust(player: BlackjackPlayer): void {
    if (player.getHandScore() > 21) {
      player.gameStatus = 'bust'
      player.chips -= player.bet
      player.winAmount -= player.bet
    }
  }

  public evaluateMove(player: BlackjackPlayer): void {
    const gameDescision: GameDecision = player.promptPlayer()
    if (gameDescision.action === 'hit') {
      player.addHand(this.deck.drawOne())
      BlackJackTable.handlePlayerBust(player)
    }
    if (gameDescision.action === 'double') {
      player.bet *= 2
      player.addHand(this.deck.drawOne())
      BlackJackTable.handlePlayerBust(player)
    }
  }

  public getTurnPlayer(): BlackjackPlayer {
    return this.players[this.turnCounter % this.playersSize]
  }

  public haveTurn(): void {
    const currentPlayer: BlackjackPlayer = this.getTurnPlayer()
    if (this.gamePhase === 'betting') {
      if (currentPlayer.gameStatus !== 'bust') this.evaluateMove(currentPlayer)
      if (this.isLastPlayer(currentPlayer)) this.gamePhase = 'acting'
    } else if (this.gamePhase === 'acting') {
      if (currentPlayer.gameStatus !== 'bust') {
        while (!this.isAllPlayerActionResolved()) {
          this.evaluateMove(currentPlayer)
        }
      }
      this.turnCounter += 1
      if (this.isLastPlayer(currentPlayer)) this.gamePhase = 'evaluatingWinner'
    } else if (this.gamePhase === 'evaluatingWinner') {
      this.gamePhase = 'roundOver'
    } else if (this.gamePhase === 'roundOver') {
      this.clearPlayerHandsAndBet()
      this.gamePhase = 'betting'
    }
  }

  public evaluateAndGetRoundResults(): Array<BlackjackPlayer> {
    const winners: Array<BlackjackPlayer> = []
    let highestScore = 0
    for (let i = 0; i < this.playersSize; i += 1) {
      if (this.players[i].gameStatus !== 'bust')
        highestScore = Math.max(highestScore, this.players[i].getHandScore())
    }
    for (let i = 0; i < this.playersSize; i += 1) {
      if (this.players[i].getHandScore() === highestScore) winners.push(this.players[i])
    }
    return winners
  }

  public static isBlackJack(player: BlackjackPlayer): boolean {
    return player.hand.length === 2 && player.getHandScore() === 21
  }

  public isAllPlayerActionResolved(): boolean {
    let resolved: boolean = true
    for (let i = 0; i < this.playersSize; i += 1) {
      if (['bust', 'stand'].findIndex((status) => this.players[i].gameStatus === status) === -1)
        resolved = false
    }
    return resolved
  }
}
