import Deck from '../common/Deck'
import GameDescision from '../common/GameDesicion'
import Table from '../common/Table'
import BlackjackPlayer from './BlackjackPlayer'

export default class BlackJackTable extends Table {
  protected players: Array<BlackjackPlayer> = []
  protected deck: Deck = new Deck('Blackjack')

  constructor(gamePhase: string) {
    super(gamePhase)
    this.players.push(new BlackjackPlayer('A', 'Blackjack'))
    this.players.push(new BlackjackPlayer('B', 'Blackjack'))
  }

  // playerのhandにpushするには、this.deck.drawOne()の戻り値がCardのみでなくてはならない
  // BlackjackPlayerクラスにaddHandメソッドを追加
  public assignPlayerHands(): void {
    for (let i = 0; i < 2; i++) {
      for (let player of this.players) {
        let card = this.deck.drawOne()
        console.log(card)
        player.addHand(card)
      }
    }
  }

  // PlayerクラスにinitializeHandAndBetメソッドを追加
  public clearPlayerHandsAndBet(): void {
    for (let player of this.players) {
      player.initializeHandAndBet()
    }
  }

  // プレイヤーの手札がbustするならgameStatusを変更する
  public handlePlayerBust(player: BlackjackPlayer): void {
    if (player.getHandScore() > 21) {
      player.gameStatus = 'bust'
      player.chips -= player.bet
      player.winAmount -= player.bet
    }
  }

  public evaluateMove(player: BlackjackPlayer): void {
    let gameDescision: GameDescision = player.promptPlayer()
    if (gameDescision.action === 'hit') {
      player.addHand(this.deck.drawOne())
      this.handlePlayerBust(player)
    }
    if (gameDescision.action === 'double') {
      player.bet *= 2
      player.addHand(this.deck.drawOne())
      this.handlePlayerBust(player)
    }
  }

  public getTurnPlayer(): BlackjackPlayer {
    return this.players[this.turnCounter % this.playersSize]
  }

  public haveTurn(): void {
    let currentPlayer: BlackjackPlayer = this.getTurnPlayer()
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
    let winners: Array<BlackjackPlayer> = []
    let highestScore = 0
    for (let player of this.players) {
      if (player.gameStatus === 'bust') continue
      highestScore = Math.max(highestScore, player.getHandScore())
    }
    for (let player of this.players) {
      if (player.getHandScore() == highestScore) winners.push(player)
    }
    return winners
  }

  public isBlackJack(player: BlackjackPlayer): boolean {
    return player.hand.length == 2 && player.getHandScore() === 21
  }

  public isAllPlayerActionResolved(): boolean {
    let resolved: boolean = true
    for (let player of this.players) {
      if (['bust', 'stand'].findIndex((status) => player.gameStatus === status) === -1)
        resolved = false
    }
    return resolved
  }
}
