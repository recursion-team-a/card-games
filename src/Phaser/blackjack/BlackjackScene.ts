import Phaser from 'phaser'
import BetScene from '../BetScene'
import BaseScene from '../common/BaseScene'
import Button from '../common/button'
import Text = Phaser.GameObjects.Text
import Image = Phaser.GameObjects.Image
import Zone = Phaser.GameObjects.Zone
import { CARD_ATLAS_KEY, CARD_HEIGHT, CARD_WIDTH } from '@/Factories/cardFactory'
import BlackJackTable from '@/model/blackJack/BlackJackTable'
import BlackjackPlayer from '@/model/blackJack/BlackjackPlayer'
import GameResult from '@/model/blackJack/gameResult'
import Deck from '@/model/common/Deck'
import { Result } from '@/model/common/types/game'
import ImageUtility from '@/utility/ImageUtility'
import { GUTTER_SIZE, textStyle } from '@/utility/constants'
import makeMoneyString from '@/utils/general'

export default class Blackjack extends BaseScene {
  constructor() {
    super({ key: 'Blackjack', active: false })
  }

  protected blackjack: BlackJackTable | undefined

  protected dealerHand: BlackjackPlayer | undefined

  protected playerHand: BlackjackPlayer | undefined

  protected playerScoreText: Text | undefined

  protected dealerScoreText: Text | undefined

  protected gameZone: Zone | undefined

  protected stayButton: Button | undefined

  public doubleButton: Button | undefined

  public surrenderButton: Button | undefined

  protected hitButton: Button | undefined

  protected playerHandZone: Zone | undefined

  protected dealerHandZone: Zone | undefined

  preload(): void {
    this.betScene = this.scene.get('BetScene') as BetScene
  }

  create(): void {
    // betsceneに戻るためのボタン
    this.createField()

    this.setUpMoneyText()

    this.setUpNewGame()

    this.createHandZone()

    this.dealInitialCards()

    // hitとstayボタンをクリックできないようにするため
    this.time.delayedCall(2000, () => {
      this.createButton()
    })
  }

  createHandZone() {
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
  }

  private handOutCard(hand: BlackjackPlayer, faceDownCard: boolean) {
    const card = this.deck?.drawOne()
    let cardImage: Image
    // falseの場合トランプをそのまま描画
    if (!faceDownCard) {
      hand.addHand(card)
      cardImage = this.add.image(0, 0, CARD_ATLAS_KEY, card?.getAtlasFrame())
    }
    // trueの場合そのトランプを裏向きで描画
    else {
      hand.receiveCardFaceDown(card)
      cardImage = this.add.image(0, 0, 'cardBack')
      this.faceDownImage = cardImage
    }
    // トランプの配置をずらす
    const xOffset = (hand.hand.length - 1) * 50
    // playerかdealerか
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

  // トランプを0.5秒おきに描画する
  private dealInitialCards() {
    setTimeout(this.handOutCard.bind(this), 1, this.playerHand, false)
    setTimeout(this.handOutCard.bind(this), 500, this.dealerHand, false)
    setTimeout(this.handOutCard.bind(this), 1000, this.playerHand, false)
    setTimeout(this.handOutCard.bind(this), 1500, this.dealerHand, true)
    setTimeout(this.isBlackjack.bind(this), 1500)
  }

  // 21かどうか
  private isBlackjack() {
    if (this.playerHand?.getHandScore() === 21) {
      this.fadeOutButton()
      this.endHand(GameResult.BLACKJACK)
    }
  }

  // ゲーム終了時
  private endHand(result: GameResult) {
    const resultObj = this.payout(result)
    const graphics = this.add.graphics({
      fillStyle: { color: 0x000000, alpha: 0.75 },
    })
    const { width, height } = this.sys.game.canvas
    const square = Phaser.Geom.Rectangle.FromXY(0, 0, width, height)
    graphics.fillRectShape(square)
    const resultText: Text = this.add.text(
      0,
      0,
      `${result} ${makeMoneyString(resultObj.winAmount)}`,
      textStyle,
    )
    resultText.setColor('#ffde3d')
    Phaser.Display.Align.In.Center(resultText, this.gameZone as Zone)
    this.fadeOutButton()
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

  // 勝敗
  private payout(result: GameResult): Result {
    let winAmount = 0
    if (result === GameResult.WIN) {
      winAmount += (<BetScene>this.betScene).bet
    } else if (result === GameResult.BLACKJACK) {
      winAmount += Math.floor((<BetScene>this.betScene).bet * 1.5)
    } else if (result === GameResult.SURRENDER) {
      winAmount -= (<BetScene>this.betScene).bet / 2
    } else if (result === GameResult.PUSH) {
      winAmount = 0
    } else {
      winAmount -= (<BetScene>this.betScene).bet
    }
    ;(<BetScene>this.betScene).money += winAmount
    this.betScene?.setUpText()
    return {
      gameResult: result,
      winAmount,
    }
  }

  // アニメーション

  private setUpNewGame() {
    // カードをdrawするために呼び出した
    this.deck = new Deck('blackjack')
    // dealerとplayersを使うために呼び出した
    this.blackjack = new BlackJackTable('')
    if (this.blackjack.players && this.blackjack.players.length >= 2) {
      ;[this.dealerHand, this.playerHand] = this.blackjack.players
    }

    this.setUpDealerScoreText()
    this.setUpPlayerScoreText()
  }

  private createButton() {
    const { height } = this.sys.game.canvas
    this.hitButton = new Button(this, 0, height / 2, 'chipOrange', 'hit')
    this.stayButton = new Button(this, 0, height / 2, 'chipYellow', 'stay')
    this.doubleButton = new Button(this, 0, height / 2, 'chipWhite', 'double')
    this.surrenderButton = new Button(this, 0, height / 2, 'chipRed', 'surrender')
    const buttons: Button[] = new Array<Button>()
    buttons.push(this.hitButton)
    buttons.push(this.stayButton)
    buttons.push(this.doubleButton)
    buttons.push(this.surrenderButton)
    ImageUtility.spaceOutImagesEvenlyHorizontally(buttons, this.scene)
    this.setUpClickHandler(this.stayButton, this.handleStay.bind(this))
    this.setUpClickHandler(this.hitButton, this.handleHit.bind(this))
    this.setUpClickHandler(this.doubleButton, this.handleDouble.bind(this))
    this.setUpClickHandler(this.surrenderButton, this.handleSurrender.bind(this))
  }

  private setUpClickHandler(button: Button, handlerFunction: Function) {
    button.on('pointerdown', () => {
      handlerFunction.call(this)
    })
  }

  private handleHit(): void {
    this.handOutCard(<BlackjackPlayer>this.playerHand, false)
    this.setPlayerScoreText()
    if ((<BlackjackPlayer>this.playerHand).getHandScore() > 21) {
      this.endHand(GameResult.BUST)
    }
  }

  private handleStay(): void {
    this.handleFlipOver()
    setTimeout(() => this.drawCardsUntil17(), this.CARD_FLIP_TIME)
  }

  private handleDouble(): void {
    this.handOutCard(<BlackjackPlayer>this.playerHand, false)
    this.setPlayerScoreText()
    ;(<BetScene>this.betScene).bet *= 2
    this.updateBetText()
    if ((<BlackjackPlayer>this.playerHand).getHandScore() > 21) {
      this.endHand(GameResult.BUST)
    }
  }

  private handleSurrender(): void {
    this.endHand(GameResult.SURRENDER)
  }

  private fadeOutButton(): void {
    this.hitButton?.destroy()
    this.stayButton?.destroy()
    this.doubleButton?.destroy()
    this.surrenderButton?.destroy()
  }

  // 17以下のときにdealerがdrawする
  private drawCardsUntil17(): void {
    const dealerScore: number = (<BlackjackPlayer>this.dealerHand).getHandScore()
    const playerScore: number = (<BlackjackPlayer>this.playerHand).getHandScore()
    if (dealerScore < 17) {
      this.handOutCard(<BlackjackPlayer>this.dealerHand, false)
      setTimeout(() => this.drawCardsUntil17(), 500)
      return
    }
    let result: GameResult
    if (dealerScore > 21 || (playerScore < 22 && playerScore > dealerScore)) {
      result = GameResult.WIN
    } else if (dealerScore === playerScore) {
      result = GameResult.PUSH
    } else {
      result = GameResult.LOSS
    }
    setTimeout(() => this.endHand(result), 500)
  }

  // cardflipする
  private handleFlipOver() {
    ;(<BlackjackPlayer>this.dealerHand)?.hand.forEach((card) => {
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
