import Phaser from 'phaser'
import Text = Phaser.GameObjects.Text
import Zone = Phaser.GameObjects.Zone
import { CARD_HEIGHT, CARD_WIDTH } from '@/Factories/cardFactory'
import BaseScene from '@/Phaser/common/BaseScene'
import BetScene from '@/Phaser/common/BetScene'
import Card from '@/Phaser/common/CardImage'
import Deck from '@/Phaser/common/DeckImage'
import Button from '@/Phaser/common/button'
import BlackjackPlayer from '@/model/blackjack/BlackjackPlayer'
import GameResult from '@/model/common/gameResult'
import { Result } from '@/model/common/types/game'
import ImageUtility from '@/utility/ImageUtility'
import { GUTTER_SIZE, textStyle } from '@/utility/constants'
import makeMoneyString from '@/utility/general'

export default class Blackjack extends BaseScene {
  constructor() {
    super({ key: 'Blackjack', active: false })
  }

  public players: Array<BlackjackPlayer> = []

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

  public width: number = 1024

  public height: number = 768

  public preload(): void {
    this.betScene = this.scene.get('BetScene') as BetScene
  }

  public create(): void {
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

  public createHandZone() {
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

  public handOutCard(
    deck: Deck,
    player: BlackjackPlayer,
    toX: number,
    toY: number,
    isFaceDown: boolean,
    isEnd?: boolean | undefined,
  ): void {
    const card: Card | undefined = deck.drawOne()

    if (!card) return

    if (!isFaceDown) {
      card.setFaceUp()
    }

    player.addHand(card)
    if (player === this.dealerHand && isEnd) {
      this.setDealerScoreText()
    }
    if (player === this.playerHand) {
      this.setPlayerScoreText()
    }
    this.children.bringToTop(card)
    card.playMoveTween(toX, toY)
  }

  // トランプを0.5秒おきに描画する
  private dealInitialCards() {
    const player = this.playerHand
    const house = this.dealerHand

    this.time.delayedCall(1, () => {
      if (this.deck) {
        this.handOutCard(
          this.deck,
          player as BlackjackPlayer,
          (this.playerHandZone as Zone).x - CARD_WIDTH * 0.15,
          (this.playerHandZone as Zone).y,
          false,
        )
      }
    })

    this.time.delayedCall(500, () => {
      if (this.deck) {
        this.handOutCard(
          this.deck,
          house as BlackjackPlayer,
          (this.dealerHandZone as Zone).x - CARD_WIDTH * 0.15,
          (this.dealerHandZone as Zone).y,
          false,
        )
      }
    })

    this.time.delayedCall(1000, () => {
      if (this.deck) {
        this.handOutCard(
          this.deck,
          player as BlackjackPlayer,
          (this.playerHandZone as Zone).x + CARD_WIDTH * 0.15,
          (this.playerHandZone as Zone).y,
          false,
        )
      }
    })

    this.time.delayedCall(1500, () => {
      if (this.deck) {
        this.handOutCard(
          this.deck,
          house as BlackjackPlayer,
          (this.dealerHandZone as Zone).x + CARD_WIDTH * 0.15,
          (this.dealerHandZone as Zone).y,
          true,
        )
      }
    })
    setTimeout(this.isBlackjack.bind(this), 2500)
  }

  // 21かどうか
  private isBlackjack() {
    if (this.playerHand?.getHandScore() === 21) {
      this.endHand(GameResult.BLACKJACK)
    }
  }

  // ゲーム終了時
  private endHand(result: GameResult) {
    this.players = []
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
            window.location.href = '/studio'
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
    this.deck = new Deck(this, -100, -100, 'blackjack')
    // dealerとplayersを使うために呼び出した
    this.players.push(new BlackjackPlayer('A', 'Blackjack'))
    this.players.push(new BlackjackPlayer('B', 'Blackjack'))
    if (this.players.length >= 2) {
      ;[this.dealerHand, this.playerHand] = this.players
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
    const handleLen = (this.playerHand as BlackjackPlayer).hand.length
    this.handOutCard(
      this.deck as Deck,
      this.playerHand as BlackjackPlayer,
      (this.playerHandZone as Zone).x + CARD_WIDTH * (handleLen * 0.3 - 0.15),
      (this.playerHandZone as Zone).y,
      false,
    )
    this.playerHand?.getHandScore()
    this.setPlayerScoreText()
    if ((this.playerHand as BlackjackPlayer).getHandScore() > 21) {
      this.endHand(GameResult.BUST)
    }
  }

  private handleStay(): void {
    this.handleFlipOver()
    setTimeout(() => this.drawCardsUntil17(), 1000)
  }

  private handleDouble(): void {
    const handleLen = (this.playerHand as BlackjackPlayer).hand.length
    this.handOutCard(
      this.deck as Deck,
      this.playerHand as BlackjackPlayer,
      (this.playerHandZone as Zone).x + CARD_WIDTH * (handleLen * 0.3 - 0.15),
      (this.playerHandZone as Zone).y,
      false,
    )
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
    const handleLen = (this.dealerHand as BlackjackPlayer).hand.length
    if (dealerScore < 17) {
      this.handOutCard(
        this.deck as Deck,
        this.dealerHand as BlackjackPlayer,
        (this.dealerHandZone as Zone).x + CARD_WIDTH * (handleLen * 0.3 - 0.15),
        (this.dealerHandZone as Zone).y,
        false,
        true,
      )
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
    setTimeout(() => this.endHand(result), 700)
  }

  // cardflipする
  private handleFlipOver() {
    ;(<BlackjackPlayer>this.dealerHand)?.hand.forEach((card) => {
      if (card.getFaceDown()) {
        card.setFaceDown(false)
        card.playFlipOverTween()
      }
    })
    this.setDealerScoreText()
  }

  private setUpDealerScoreText(): void {
    this.dealerScoreText = this.add.text(0, 200, '', textStyle)
    this.setDealerScoreText(true)
    Phaser.Display.Align.In.TopCenter(this.dealerScoreText, this.gameZone as Zone, 0, -20)
  }

  private setUpPlayerScoreText(): void {
    this.playerScoreText = this.add.text(0, 300, '', textStyle)
    this.setPlayerScoreText()
    Phaser.Display.Align.In.BottomCenter(this.playerScoreText, this.gameZone as Zone, 0, -20)
  }

  private setDealerScoreText(isStart?: boolean | undefined) {
    if (isStart) {
      ;(this.dealerScoreText as Text).setText('Dealer Score: ??')
    } else {
      ;(this.dealerScoreText as Text).setText(`Dealer Score: ${this.dealerHand?.getHandScore()}`)
    }
  }

  private setPlayerScoreText() {
    ;(this.playerScoreText as Text).setText(`Your Score: ${this.playerHand?.getHandScore()}`)
  }
}
