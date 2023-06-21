import * as path from 'path'
import Phaser from 'phaser'
import Text = Phaser.GameObjects.Text
import Texture = Phaser.Textures.Texture
import Image = Phaser.GameObjects.Image
import Zone = Phaser.GameObjects.Zone
import TimeEvent = Phaser.Time.TimerEvent
import { CARD_ATLAS_KEY, CARD_HEIGHT, CARD_WIDTH, CardFactory } from '@/Factories/cardFactory'
import BetScene from '@/Phaser/BetScene'
import BlackjackPlayer from '@/model/blackjack/BlackjackPlayer'
import BlackJackTable from '@/model/blackjack/BlackjackTable'
import GameResult from '@/model/blackjack/gameResult'
import Deck from '@/model/common/Deck'
import { GUTTER_SIZE, textStyle } from '@/utility/constants'

export default class MainScene extends Phaser.Scene {
  private blackjack: BlackJackTable | undefined

  private dealerHand: BlackjackPlayer | undefined

  private playerHand: BlackjackPlayer | undefined

  private deck: Deck | undefined

  private atlasTexture: Texture | undefined

  private CARD_MARGIN = 10

  private dealerScoreText: Text | undefined

  private playerScoreText: Text | undefined

  private textHit: Text | undefined

  private textStay: Text | undefined

  private moneyText: Text | undefined

  private cardImages: Image[] | undefined

  private betScene: BetScene | undefined

  private gameZone: Zone | undefined

  private stayButton: Image | undefined

  private hitButton: Image | undefined

  private playerHandZone: Zone | undefined

  private dealerHandZone: Zone | undefined

  private faceDownImage: Image | undefined

  private CARD_FLIP_TIME = 600

  private timeEvent: TimeEvent | undefined

  private cardFactory: CardFactory | undefined

  constructor() {
    super({ key: 'MainScene', active: false })
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
    this.betScene = this.scene.get('BetScene') as BetScene
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
      this.scene.start('BetScene')
    })

    this.gameZone = this.add.zone(width * 0.5, height * 0.5, width, height)
    this.setUpMoneyText()
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
    this.dealInitialCards()
    this.time.delayedCall(2000, () => {
      this.setUpHitButton()
      this.setUpStayButton()
    })
  }

  private handOutCard(hand: BlackjackPlayer, faceDownCard: boolean) {
    const card = this.deck?.drawOne()
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

  private dealInitialCards() {
    setTimeout(this.handOutCard.bind(this), 1, this.playerHand, false)
    setTimeout(this.handOutCard.bind(this), 500, this.dealerHand, true)
    setTimeout(this.checkForBlackJack.bind(this), 1500)
  }

  private checkForBlackJack() {
    if (this.playerHand?.getHandScore() === 21) {
      this.endHand(GameResult.BLACKJACK)
    }
  }

  private handleHit(): void {
    this.handOutCard(<BlackjackPlayer>this.playerHand, false)
    this.setPlayerScoreText()
    if ((<BlackjackPlayer>this.playerHand).getHandScore() > 21) {
      ;(this.textHit as Text).destroy()
      ;(this.textStay as Text).destroy()
      this.endHand(GameResult.BUST)
    }
  }

  private endHand(result: GameResult) {
    this.payout(result)
    const graphics = this.add.graphics({
      fillStyle: { color: 0x000000, alpha: 0.75 },
    })
    const { width, height } = this.sys.game.canvas
    const square = Phaser.Geom.Rectangle.FromXY(0, 0, width, height)
    graphics.fillRectShape(square)
    const resultText: Text = this.add.text(0, 0, <string>result, textStyle)
    resultText.setColor('#ffde3d')
    Phaser.Display.Align.In.Center(resultText, this.gameZone as Zone)
    this.input.once(
      'pointerdown',
      () => {
        this.input.once(
          'pointerdown',
          () => {
            this.scene.start('BetScene')
          },
          this,
        )
      },
      this,
    )
  }

  private payout(result: GameResult) {
    if (result === GameResult.WIN) {
      ;(<BetScene>this.betScene).money += (<BetScene>this.betScene).bet
    } else if (result === GameResult.BLACKJACK) {
      ;(<BetScene>this.betScene).money += Math.floor((<BetScene>this.betScene).bet * 1.5)
    } else {
      ;(<BetScene>this.betScene).money -= (<BetScene>this.betScene).bet
    }
    this.updateMoneyText()
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

  private setUpMoneyText(): void {
    this.moneyText = this.add.text(0, 0, '', textStyle)
    const betText: Text = this.add.text(0, 0, '', textStyle)

    this.updateMoneyText()
    this.updateBetText(betText)
  }

  private updateMoneyText(): void {
    ;(this.moneyText as Text).setText(`Money: $${(<BetScene>this.betScene).money}`)
    Phaser.Display.Align.In.TopRight(this.moneyText as Text, this.gameZone as Zone, -20, -20)
  }

  private updateBetText(text: Text) {
    text.setText(`Bet: $${(<BetScene>this.betScene).bet}`)
    Phaser.Display.Align.To.BottomLeft(text, this.moneyText as Text)
  }

  private setUpNewGame() {
    this.deck = new Deck('blackjack')
    this.blackjack = new BlackJackTable('')
    if (this.blackjack.players && this.blackjack.players.length >= 2) {
      ;[this.dealerHand, this.playerHand] = this.blackjack.players
    }
    this.setUpDealerScoreText()
    this.setUpPlayerScoreText()
  }

  private setUpHitButton() {
    this.hitButton = this.add
      .image(
        (this.gameZone as Zone).width * 0.33,
        (this.gameZone as Zone).height * 0.5,
        'chipYellow',
      )
      .setScale(1.4 * (<BetScene>this.betScene).p_scale)
    this.textHit = this.add.text(
      (this.gameZone as Zone).width * 0.33,
      (this.gameZone as Zone).height * 0.5,
      'Hit',
      textStyle,
    )
    Phaser.Display.Align.In.Center(this.textHit, this.hitButton)
    this.hitButton.setInteractive()
    this.setUpHoverStyles(this.hitButton)
    this.setUpClickHandler(this.hitButton, this.handleHit.bind(this))
  }

  private setUpClickHandler(image: Image, handlerFunction: Function) {
    image.on('pointerdown', () => {
      handlerFunction.call(this)
    })
  }

  private setUpHoverStyles(image: Image) {
    image.on(
      'pointerover',
      () => {
        image.setScale(1.4 * (<BetScene>this.betScene).p_scale)
      },
      this,
    )
    image.on(
      'pointerout',
      () => {
        image.setScale(1.2 * (<BetScene>this.betScene).p_scale)
      },
      this,
    )
  }

  private setUpStayButton(): void {
    this.stayButton = this.add
      .image(
        (this.gameZone as Zone).width * 0.66,
        (this.gameZone as Zone).height * 0.5,
        'chipOrange',
      )
      .setScale(1.4 * (<BetScene>this.betScene).p_scale)
    this.textStay = this.add.text(
      (this.gameZone as Zone).width * 0.66,
      (this.gameZone as Zone).height * 0.5,
      'Stay',
      textStyle,
    )
    Phaser.Display.Align.In.Center(this.textStay, this.stayButton)
    this.stayButton.setInteractive()
    this.setUpHoverStyles(this.stayButton)
    this.setUpClickHandler(this.stayButton, this.handleStay.bind(this))
  }

  private handleStay(): void {
    ;(this.textStay as Text).destroy()
    ;(this.textHit as Text).destroy()
    this.handleFlipOver()
    setTimeout(() => this.drawCardsUntil17(), this.CARD_FLIP_TIME)
  }

  private drawCardsUntil17(): void {
    const dealerScore: number = (<BlackjackPlayer>this.dealerHand).getHandScore()
    const playerScore: number = (<BlackjackPlayer>this.playerHand).getHandScore()
    if (dealerScore < 17) {
      this.handOutCard(<BlackjackPlayer>this.dealerHand, false)
      setTimeout(() => this.drawCardsUntil17(), 500)
      return
    }
    let result: GameResult = GameResult.NONE
    if (dealerScore > 21 || (playerScore < 22 && playerScore > dealerScore)) {
      result = GameResult.WIN
    } else if (dealerScore === playerScore) {
      result = GameResult.PUSH
    } else {
      result = GameResult.LOSS
    }
    setTimeout(() => this.endHand(result), 500)
  }

  private handleFlipOver() {
    ;(<BlackjackPlayer>this.dealerHand)?.p_hand.forEach((card) => {
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
    ;(this.dealerScoreText as Text).setText(`Dealer Score: ${this.dealerHand?.getHandScore()}`)
  }

  private setPlayerScoreText() {
    ;(this.playerScoreText as Text).setText(`Your Score: ${this.playerHand?.getHandScore()}`)
  }
}
