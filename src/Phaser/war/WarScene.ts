import Phaser from 'phaser'
import BitmapText = Phaser.GameObjects.BitmapText
import Zone = Phaser.GameObjects.Zone
import { CARD_HEIGHT, CARD_WIDTH } from '@/Factories/cardFactory'
import BaseScene from '@/Phaser/common/BaseScene'
import Card from '@/Phaser/common/CardImage'
import Deck from '@/Phaser/common/DeckImage'
import Button from '@/Phaser/common/button'
import GameResult from '@/model/common/gameResult'
import WarPlayer from '@/model/war/WarPlayer'
import { GUTTER_SIZE } from '@/utility/constants'

export default class WarScene extends BaseScene {
  private dealerHand: WarPlayer

  private playerHand: WarPlayer

  private dealerLead: Array<Card> = []

  private playerLead: Array<Card> = []

  private dealerScoreText: BitmapText | undefined

  private playerScoreText: BitmapText | undefined

  private stayButton: Button | undefined

  private playerHandZone: Zone | undefined

  private dealerHandZone: Zone | undefined

  private playerScore: number

  private dealerScore: number

  public width: number = 1024

  public height: number = 768

  public players: Array<WarPlayer>

  constructor() {
    super({ key: 'WarScene', active: false })
    this.playerScore = 0
    this.dealerScore = 0
    this.players = [new WarPlayer('Player', 'Player'), new WarPlayer('Dealer', 'Dealer')]
    this.dealerHand = new WarPlayer('Dealer', 'Dealer')
    this.playerHand = new WarPlayer('Player', 'Player')
  }

  public create(): void {
    this.deck = new Deck(this, -100, -100, 'war')
    super.createField()
    this.createHandZone()
    this.haveTurn()
  }

  public createHandZone() {
    this.playerHandZone = this.add.zone(0, 0, CARD_WIDTH, CARD_HEIGHT)
    this.setUpPlayerScoreText()
    Phaser.Display.Align.To.TopCenter(
      this.playerHandZone as Zone,
      this.playerScoreText as BitmapText,
      0,
      GUTTER_SIZE,
    )

    this.dealerHandZone = this.add.zone(0, 0, CARD_WIDTH, CARD_HEIGHT)
    this.setUpDealerScoreText()
    Phaser.Display.Align.To.BottomCenter(
      this.dealerHandZone as Zone,
      this.dealerScoreText as BitmapText,
      0,
      GUTTER_SIZE,
    )
  }

  private haveTurn() {
    this.assignPlayerCards()
    this.time.delayedCall(2000, () => {
      this.setUpBattleButton()
    })
  }

  public handOutCard(
    deck: Deck,
    player: WarPlayer,
    toX: number,
    toY: number,
    isFaceDown: boolean,
  ): void {
    const card: Card | undefined = deck.drawOne()

    if (!card) return

    if (!isFaceDown) {
      card.setFaceUp()
    }

    player.addHand(card)
    if (player === this.dealerHand) {
      this.dealerLead.push(card)
      this.setDealerScoreText()
    } else {
      this.playerLead.push(card)
      this.setPlayerScoreText()
    }
    this.children.bringToTop(card)
    card.playMoveTween(toX, toY)
  }

  //   // プレイヤーに手札を配る
  private assignPlayerCards() {
    const player = this.playerHand
    const house = this.dealerHand
    this.time.delayedCall(1, () => {
      if (this.deck) {
        this.handOutCard(
          this.deck,
          player as WarPlayer,
          (this.playerHandZone as Zone).x,
          (this.playerHandZone as Zone).y,
          false,
        )
      }
    })

    this.time.delayedCall(500, () => {
      if (this.deck) {
        this.handOutCard(
          this.deck,
          house as WarPlayer,
          (this.dealerHandZone as Zone).x,
          (this.dealerHandZone as Zone).y,
          true,
        )
      }
    })
  }

  private handleBattle(): void {
    this.stayButton?.destroy()
    this.dealerLead[this.dealerLead.length - 1].playFlipOverTween()
    setTimeout(() => this.evaluateWinner(), this.CARD_FLIP_TIME)
  }

  private showResult(result: GameResult) {
    const resultText: BitmapText = this.add.bitmapText(0, 0, 'arcade', <string>result, 30)
    if (result === 'WIN') {
      this.sound.play('win')
      resultText.setTint(0xffde3d)
    } else {
      this.sound.play('negative')
      resultText.setTint(0xff0000)
    }
    Phaser.Display.Align.In.Center(resultText, this.gameZone as Zone)
    setTimeout(() => {
      resultText.destroy()
      if ((this.deck as Deck).getDeckSize() <= 0) {
        this.handleEndOfGame()
      } else {
        this.haveTurn()
      }
    }, 1000)
  }

  private handleEndOfGame() {
    let result: GameResult
    if (this.playerScore < this.dealerScore) result = GameResult.WIN
    else if (this.playerScore > this.dealerScore) result = GameResult.LOSS
    else result = GameResult.TIE
    const graphics = this.add.graphics({
      fillStyle: { color: 0x000000, alpha: 0.75 },
    })
    const { width, height } = this.sys.game.canvas
    const square = Phaser.Geom.Rectangle.FromXY(0, 0, width, height)
    graphics.fillRectShape(square)
    const resultText: BitmapText = this.add.bitmapText(0, 0, 'arcade', <string>result, 30)
    if (result === 'WIN') {
      this.sound.play('win')
      resultText.setTint(0xffde3d)
    } else {
      this.sound.play('negative')
      resultText.setTint(0xff0000)
    }
    Phaser.Display.Align.In.Center(resultText, this.gameZone as Zone)
    setTimeout(() => {
      resultText.destroy()
      graphics.destroy()
      this.scene.start('ContinueScene', { nextScene: 'WarScene' })
    }, 5000)
  }

  private setUpBattleButton(): void {
    this.stayButton = new Button(this, this.width / 2, this.height / 2, 'largeRedButton', 'battle')
    this.stayButton.setClickHandler(() => {
      this.handleBattle()
    })
  }

  private evaluateWinner(): void {
    const dealerScore: number = this.dealerLead[this.dealerLead.length - 1].getRankNumber('war')
    const playerScore: number = this.playerLead[this.playerLead.length - 1].getRankNumber('war')
    let result: GameResult
    if (dealerScore < playerScore) {
      result = GameResult.WIN
      this.dealerScore += this.dealerLead.length + this.playerLead.length
      this.dealerLead = []
      this.playerLead = []
    } else if (dealerScore > playerScore) {
      result = GameResult.LOSS
      this.playerScore += this.dealerLead.length + this.playerLead.length
      this.dealerLead = []
      this.playerLead = []
    } else {
      result = GameResult.TIE
    }
    setTimeout(() => this.showResult(result), 500)
  }

  private setUpDealerScoreText(): void {
    this.dealerScoreText = this.add.bitmapText(0, 200, 'arcade', '', 30)
    this.setDealerScoreText()
    Phaser.Display.Align.In.TopCenter(this.dealerScoreText, this.gameZone as Zone, 0, -20)
  }

  private setUpPlayerScoreText(): void {
    this.playerScoreText = this.add.bitmapText(0, 300, 'arcade', '', 30)
    this.setPlayerScoreText()
    Phaser.Display.Align.In.BottomCenter(this.playerScoreText, this.gameZone as Zone, 0, -20)
  }

  private setDealerScoreText() {
    ;(this.dealerScoreText as BitmapText).setText(`Dealer Score: ${this.playerScore}`)
  }

  private setPlayerScoreText() {
    ;(this.playerScoreText as BitmapText).setText(`Your Score: ${this.dealerScore}`)
  }
}
