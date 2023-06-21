import * as path from 'path'
import Phaser from 'phaser'
import Text = Phaser.GameObjects.Text
import Texture = Phaser.Textures.Texture
import Image = Phaser.GameObjects.Image
import Zone = Phaser.GameObjects.Zone
import TimeEvent = Phaser.Time.TimerEvent
import { CARD_ATLAS_KEY, CARD_HEIGHT, CARD_WIDTH, CardFactory } from '@/Factories/cardFactory'
import Card from '@/model/common/Card'
import Deck from '@/model/common/Deck'
import warPlayer from '@/model/war/WarPlayer'
import WarPlayer from '@/model/war/WarPlayer'
import GameResult from '@/model/war/gameResult'
import { GUTTER_SIZE, textStyle } from '@/utility/constants'

export default class MainScene extends Phaser.Scene {
  private dealerHand: warPlayer

  private playerHand: warPlayer

  private dealerLead: Array<Card> = []

  private playerLead: Array<Card> = []

  private deck: Deck

  private atlasTexture: Texture | undefined

  private CARD_MARGIN = 10

  private dealerScoreText: Text | undefined

  private playerScoreText: Text | undefined

  private textHit: Text | undefined

  private textStay: Text | undefined

  private moneyText: Text | undefined

  private cardImages: Image[] | undefined

  private gameZone: Zone | undefined

  private stayButton: Image | undefined

  private hitButton: Image | undefined

  private playerHandZone: Zone | undefined

  private dealerHandZone: Zone | undefined

  private playerScore: number

  private dealerScore: number

  private faceDownImage: Image | undefined

  private CARD_FLIP_TIME = 600

  private timeEvent: TimeEvent | undefined

  private cardFactory: CardFactory | undefined

  constructor() {
    super({ key: 'MainScene', active: false })
    this.playerScore = 0
    this.dealerScore = 0
    this.deck = new Deck('war')
    this.dealerHand = new WarPlayer('Dealer', 'Dealer')
    this.playerHand = new WarPlayer('Player', 'Player')
  }

  preload(): void {
    this.cardFactory = new CardFactory(
      this,
      path.join('/assets/Cards', 'playingCards.png'),
      path.join('/assets/Cards/', 'playingCards.xml'),
    )
    this.load.image('table', path.join('/assets', 'table.jpg'))
    this.atlasTexture = this.textures.get(CARD_ATLAS_KEY)
    this.load.image('back', path.join('/assets', 'back.png'))
    this.load.image('cardBack', path.join('/assets/Cards', 'cardBack.png'))
    this.load.image('chipYellow', path.join('/assets/Chips', 'chipYellow.png'))
    this.load.image('chipOrange', path.join('/assets/Chips', 'chipOrange.png'))
  }

  create(): void {
    const { width, height } = this.sys.game.canvas
    this.add.image(100, 300, 'table')
    const table = this.add.image(width / 2, height / 2, 'table')
    const scaleX = width / table.width
    const scaleY = height / table.height
    const scale = Math.max(scaleX, scaleY)
    table.setScale(scale).setScrollFactor(0)

    const button = this.add.image(100, 100, 'back')
    const buttonScale = Math.min(width / 1920, height / 1080) * 1.5
    button.setScale(buttonScale)

    button.setInteractive()

    button.on('pointerdown', () => {
      window.location.href = '/studio'
    })

    this.gameZone = this.add.zone(width * 0.5, height * 0.5, width, height)
    this.setUpNewGame()
    this.playerHandZone = this.add.zone(0, 0, CARD_WIDTH, CARD_HEIGHT)
    Phaser.Display.Align.To.TopLeft(
      this.playerHandZone,
      this.playerScoreText as Text,
      0,
      GUTTER_SIZE,
    )

    this.dealerHandZone = this.add.zone(0, 0, CARD_WIDTH, CARD_HEIGHT)
    Phaser.Display.Align.To.BottomLeft(
      this.dealerHandZone,
      this.dealerScoreText as Text,
      0,
      GUTTER_SIZE,
    )
    this.haveTurn()
  }

  private haveTurn() {
    this.assignPlayerCards()
    this.time.delayedCall(2000, () => {
      this.setUpBattleButton()
    })
  }

  private handOutCard(hand: warPlayer, lead: Array<Card>, faceDownCard: boolean) {
    const card = this.deck.drawOne()
    lead.push(<any>card)
    let cardImage: Image
    if (!faceDownCard) {
      hand.addHand(card)
      cardImage = this.add.image(0, 0, CARD_ATLAS_KEY, card?.getAtlasFrame())
    } else {
      hand.receiveCardFaceDown(card)
      cardImage = this.add.image(0, 0, 'cardBack')
      this.faceDownImage = cardImage
    }
    const xOffset = hand.p_hand.length - 1
    if (hand === this.playerHand) {
      this.createCardTween(
        cardImage,
        (this.playerHandZone as Zone).x + xOffset,
        (this.playerHandZone as Zone).y,
      )
      this.setPlayerScoreText()
    } else {
      this.createCardTween(
        cardImage,
        (this.dealerHandZone as Zone).x + xOffset,
        (this.dealerHandZone as Zone).y,
        350,
      )
      this.setDealerScoreText()
    }
  }

  // プレイヤーに手札を配る
  private assignPlayerCards() {
    setTimeout(this.handOutCard.bind(this), 1, this.playerHand, this.playerLead, false)
    setTimeout(this.handOutCard.bind(this), 500, this.dealerHand, this.dealerLead, true)
  }

  private handleBattle(): void {
    ;(this.textStay as Text).destroy()
    this.handleFlipOver()
    setTimeout(() => this.evaluateWinner(), this.CARD_FLIP_TIME)
  }

  private showResult(result: GameResult) {
    const graphics = this.add.graphics({
      fillStyle: { color: 0x000000, alpha: 0.75 },
    })
    const { width, height } = this.sys.game.canvas
    const square = Phaser.Geom.Rectangle.FromXY(0, 0, width, height)
    graphics.fillRectShape(square)
    const resultText: Text = this.add.text(0, 0, <string>result, textStyle)
    resultText.setColor('#ffde3d')
    Phaser.Display.Align.In.Center(resultText, this.gameZone as Zone)
    this.haveTurn()
  }

  private createCardTween(image: Image, x: number, y: number, duration: number = 500) {
    this.tweens.add({
      targets: image,
      x,
      y,
      duration,
      ease: 'Linear',
    })
  }

  private setUpNewGame() {
    this.setUpDealerScoreText()
    this.setUpPlayerScoreText()
  }

  private setUpClickHandler(image: Image, handlerFunction: Function) {
    image.on('pointerdown', () => {
      handlerFunction.call(this)
    })
  }

  private setUpHoverStyles(image: Image) {
    image.on('pointerover', () => {}, this)
    image.on('pointerout', () => {}, this)
  }

  private setUpBattleButton(): void {
    this.stayButton = this.add
      .image(
        (this.gameZone as Zone).width * 0.66,
        (this.gameZone as Zone).height * 0.5,
        'chipOrange',
      )
      .setScale(1.4)
    this.textStay = this.add.text(
      (this.gameZone as Zone).width * 0.66,
      (this.gameZone as Zone).height * 0.5,
      'Battle',
      textStyle,
    )
    Phaser.Display.Align.In.Center(this.textStay, this.stayButton)
    this.stayButton.setInteractive()
    this.setUpHoverStyles(this.stayButton)
    this.setUpClickHandler(this.stayButton, this.handleBattle.bind(this))
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

  private handleFlipOver() {
    ;(<warPlayer>this.dealerHand)?.p_hand.forEach((card) => {
      if (card.getFaceDown()) {
        card.setFaceDown(false)
        const cardFront = this.add.image(
          (this.faceDownImage as Image).x,
          (this.faceDownImage as Image).y,
          CARD_ATLAS_KEY,
          card.getAtlasFrame(),
        )
        cardFront.setScale(0, 1)
        this.flipOverCard(this.faceDownImage as Image, cardFront)
      }
    })
    this.setDealerScoreText()
  }

  private flipOverCard(cardBack: Image, cardFront: Image) {
    this.tweens.add({
      targets: cardBack,
      scaleX: 0,
      duration: this.CARD_FLIP_TIME / 2,
      ease: 'Linear',
    })
    this.tweens.add({
      targets: cardFront,
      scaleX: 1,
      duration: this.CARD_FLIP_TIME / 2,
      delay: this.CARD_FLIP_TIME / 2,
      ease: 'Linear',
    })
  }

  private setUpDealerScoreText(): void {
    this.dealerScoreText = this.add.text(0, 200, '', textStyle)
    this.setDealerScoreText()
    Phaser.Display.Align.In.TopCenter(this.dealerScoreText, this.gameZone as Zone, 0, -20)
  }

  private setUpPlayerScoreText(): void {
    this.playerScoreText = this.add.text(0, 300, '', textStyle)
    this.setPlayerScoreText()
    Phaser.Display.Align.In.BottomCenter(this.playerScoreText, this.gameZone as Zone, 0, -20)
  }

  private setDealerScoreText() {
    ;(this.dealerScoreText as Text).setText(`Dealer Score: ${this.playerScore}`)
  }

  private setPlayerScoreText() {
    ;(this.playerScoreText as Text).setText(`Your Score: ${this.dealerScore}`)
  }
}
