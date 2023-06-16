import * as path from 'path'
import Phaser from 'phaser'
import ImageUtility from '../utility/ImageUtility'
import { textStyle } from '../utility/constants'
import Zone = Phaser.GameObjects.Zone
import Image = Phaser.GameObjects.Image
import Text = Phaser.GameObjects.Text

export default class BetScene extends Phaser.Scene {
  public gameZone?: Zone

  public p_scale: number = 1

  public money: number = 1000

  public bet: number = 0

  public moneyText: Text | undefined

  public betText: Text | undefined

  public highScoreText: Text | undefined

  constructor() {
    super({ key: 'BetScene', active: true })
  }

  preload(): void {
    this.load.image('betTable', path.join('/assets', 'betTable.jpg'))
    this.load.image('chipYellow', path.join('/assets/Chips', 'chipYellow.png'))
    this.load.image('chipOrange', path.join('/assets/Chips', 'chipOrange.png'))
    this.load.image('chipRed', path.join('/assets/Chips', 'chipRed.png'))
    this.load.image('chipWhite', path.join('/assets/Chips', 'chipWhite.png'))
    this.load.image('chipBlue', path.join('/assets/Chips', 'chipBlue.png'))
    this.load.image('back', path.join('/assets', 'back.png'))
  }

  create(): void {
    const { width, height } = this.sys.game.canvas

    const table = this.add.image(width / 2, height / 2, 'betTable')
    const tableScaleX = width / table.width
    const tableScaleY = height / table.height
    const tableScale = Math.max(tableScaleX, tableScaleY)
    table.setScale(tableScale)

    this.gameZone = this.add.zone(width * 0.5, height * 0.5, width, height)
    this.createChips(width, height)
    const button = this.add.image(100, 100, 'back')
    const buttonScale = Math.min(width / 1920, height / 1080) * 1.5
    button.setScale(buttonScale)

    button.setInteractive()

    button.on('pointerdown', () => {
      window.location.href = '/studio'
    })

    this.setUpTitle()
    this.setUpText()
  }

  private setUpTitle(): void {
    const textTitle: Text = this.add.text(0, 20, 'Place your bet', textStyle)
    Phaser.Display.Align.In.Center(
      textTitle,
      this.gameZone as Zone,
      0,
      -((this.gameZone as Zone).height * 0.25),
    )
  }

  private setUpBetButtonHandlers(buttons: Image[]): void {
    buttons.forEach((button) => {
      button.on(
        'pointerdown',
        () => {
          this.addChip(button.data.get('value'))
        },
        this,
      )
    }, this)
  }

  private createChips(width: number, height: number): void {
    this.p_scale = Math.min(width / 1920, height / 1080)
    const chipYellow = this.add.image(0, 0, 'chipYellow').setScale(this.p_scale)
    const chipWhite = this.add.image(0, 0, 'chipWhite').setScale(this.p_scale)
    const chipRed = this.add.image(0, 0, 'chipRed').setScale(this.p_scale)
    const chipOrange = this.add.image(0, 0, 'chipOrange').setScale(this.p_scale)

    const add1 = this.add.text(175, 375, '1', textStyle)
    chipYellow.setInteractive()
    chipYellow.setDataEnabled()
    chipYellow.data.set('value', 1)
    this.setUpHoverButtons(chipYellow)

    const add25 = this.add.text(360, 375, '25', textStyle)
    chipWhite.setInteractive()
    chipWhite.setDataEnabled()
    chipWhite.data.set('value', 25)
    this.setUpHoverButtons(chipWhite)

    const add50 = this.add.text(550, 375, '50', textStyle)
    chipRed.setInteractive()
    chipRed.setDataEnabled()
    chipRed.data.set('value', 100)
    this.setUpHoverButtons(chipRed)

    const add100 = this.add.text(740, 375, '100', textStyle)
    chipOrange.setInteractive()
    chipOrange.setDataEnabled()
    chipOrange.data.set('value', 100)
    this.setUpHoverButtons(chipOrange)
    this.setUpButtons()

    const chips: Image[] = new Array<Image>()
    chips.push(chipYellow)
    chips.push(chipWhite)
    chips.push(chipRed)
    chips.push(chipOrange)

    Phaser.Display.Align.In.Center(chipYellow, this.gameZone as Zone, -308, -50)
    Phaser.Display.Align.In.Center(chipWhite, this.gameZone as Zone, -102, -50)
    Phaser.Display.Align.In.Center(chipRed, this.gameZone as Zone, 102, -50)
    Phaser.Display.Align.In.Center(chipOrange, this.gameZone as Zone, 305, -50)
    Phaser.Display.Align.In.Center(add1, chipYellow)
    Phaser.Display.Align.In.Center(add25, chipWhite)
    Phaser.Display.Align.In.Center(add50, chipRed)
    Phaser.Display.Align.In.Center(add100, chipOrange)
    ImageUtility.spaceOutImagesEvenlyHorizontally(chips, this.scene)
    this.setUpBetButtonHandlers(chips)
  }

  private addChip(value: number) {
    this.bet += value
    if (this.bet > this.money) this.bet = this.money
    this.updateBetText()
  }

  private updateBetText() {
    this.betText?.setText(`Bet: $${this.bet}`)
    Phaser.Display.Align.To.BottomLeft(this.betText as Text, this.moneyText as Text)
  }

  private setUpText(): void {
    this.moneyText = this.add.text(0, 0, '', textStyle)
    this.betText = this.add.text(0, 0, '', textStyle)
    this.highScoreText = this.add.text(0, 0, '', textStyle)

    this.updateMoneyText()
    this.updateBetText()
    this.updateHighScoreText()
  }

  private updateHighScoreText() {
    ;(this.highScoreText as Text).setText(`High score: $${100}`)
    Phaser.Display.Align.In.TopCenter(<Text>this.highScoreText, this.gameZone as Zone, 200, 200)
  }

  private updateMoneyText(): void {
    ;(this.moneyText as Text).setText(`Money: $${this.money}`)
    Phaser.Display.Align.In.TopRight(this.moneyText as Text, this.gameZone as Zone, -20, -20)
  }

  setUpHoverButtons(image: Image): void {
    image.on(
      'pointerover',
      () => {
        image.setScale(1.4 * this.p_scale)
      },
      this,
    )
    image.on(
      'pointerout',
      () => {
        image.setScale(1.2 * this.p_scale)
      },
      this,
    )
  }

  setUpButtons(): void {
    const clearButton = this.add.image(0, 500, 'chipBlue').setScale(1.4 * this.p_scale)
    const clearText = this.add.text(0, 575, 'Clear', textStyle)
    const dealButton = this.add.image(0, 500, 'chipBlue').setScale(1.4 * this.p_scale)
    const dealText = this.add.text(0, 575, 'Deal', textStyle)
    Phaser.Display.Align.In.BottomCenter(
      clearButton,
      this.gameZone as Zone,
      0,
      -(200 * this.p_scale),
    )
    Phaser.Display.Align.In.BottomCenter(
      dealButton,
      this.gameZone as Zone,
      0,
      -(200 * this.p_scale),
    )
    clearButton.setInteractive()
    dealButton.setInteractive()
    this.setUpHoverButtons(clearButton)
    this.setUpHoverButtons(dealButton)
    clearButton.on(
      'pointerdown',
      () => {
        this.bet = 0
        this.updateBetText()
      },
      this,
    )
    dealButton.on(
      'pointerdown',
      () => {
        this.scene.start('MainScene')
      },
      this,
    )
    const buttons: Image[] = new Array<Image>()
    buttons.push(clearButton)
    buttons.push(dealButton)
    ImageUtility.spaceOutImagesEvenlyHorizontally(buttons, this.scene)
    Phaser.Display.Align.In.Center(clearText, clearButton)
    Phaser.Display.Align.In.Center(dealText, dealButton)
  }
}
