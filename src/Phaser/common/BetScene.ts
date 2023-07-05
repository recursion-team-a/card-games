import Phaser from 'phaser'
import Zone = Phaser.GameObjects.Zone
import Image = Phaser.GameObjects.Image
import BitmapText = Phaser.GameObjects.BitmapText
import PreloadScene from '@/Phaser/common/PreloadScene'
import Button from '@/Phaser/common/button'
import ImageUtility from '@/utility/ImageUtility'

export default class BetScene extends PreloadScene {
  public gameZone?: Zone

  public p_scale: number = 1

  public money: number = 1000

  public bet: number = 0

  public moneyText: BitmapText | undefined

  public betText: BitmapText | undefined

  public highScoreText: BitmapText | undefined

  public height: number = 1000

  public width: number = 1000

  constructor() {
    super({ key: 'BetScene', active: true })
  }

  public create(): void {
    const { width, height } = this.sys.game.canvas
    this.height = height
    this.width = width
    const table = this.add.image(this.width / 2, this.height / 2, 'betTable')
    const tableScaleX = this.width / table.width
    const tableScaleY = this.height / table.height
    const tableScale = Math.max(tableScaleX, tableScaleY)
    table.setScale(tableScale)

    this.gameZone = this.add.zone(this.width * 0.5, this.height * 0.5, this.width, this.height)
    this.createChips()

    const button = this.add.image(100, 100, 'back')
    const buttonScale = Math.min(this.width / 1920, this.height / 1080) * 1.5
    button.setScale(buttonScale)

    button.setInteractive()

    button.on('pointerdown', () => {
      window.location.href = '/studio'
    })

    this.setUpTitle()
    this.setUpText()
  }

  private setUpTitle(): void {
    const textTitle: BitmapText = this.add.bitmapText(0, 20, 'arcade', 'Place your bet', 30)
    Phaser.Display.Align.In.Center(
      textTitle,
      this.gameZone as Zone,
      0,
      -((this.gameZone as Zone).height * 0.25),
    )
  }

  // ボタンハンドラ
  private setUpBetButtonHandlers(buttons: Image[]): void {
    buttons.forEach((button) => {
      button.on(
        'pointerdown',
        () => {
          this.addChip(button.data.get('value'))
          this.sound.play('coin')
        },
        this,
      )
    }, this)
  }

  private createChips(): void {
    const chipHeight: number = Number(this.height) / 2
    const whiteChip = new Button(this, 0, chipHeight, 'chipYellow', '1', 1)
    const yellowChip = new Button(this, 0, chipHeight, 'chipGray', '10', 10)
    const redChip = new Button(this, 0, chipHeight, 'chipRed', '50', 50)
    const orangeChip = new Button(this, 0, chipHeight, 'chipOrange', '100', 100)
    // リファクタリングしたい
    this.setUpButtons()

    const chips: Button[] = new Array<Button>()
    chips.push(whiteChip)
    chips.push(yellowChip)
    chips.push(redChip)
    chips.push(orangeChip)

    ImageUtility.spaceOutImagesEvenlyHorizontally(chips, this.scene)
    this.setUpBetButtonHandlers(chips)
  }

  private addChip(value: number) {
    this.bet += value
    if (this.bet > this.money) this.bet = this.money
    this.updateBetText()
  }

  public updateBetText() {
    this.betText?.setText(`Bet: $${this.bet}`)
    Phaser.Display.Align.To.BottomLeft(this.betText as BitmapText, this.moneyText as BitmapText)
  }

  public setUpText(): void {
    this.moneyText = this.add.bitmapText(0, 0, 'arcade', '', 20)
    this.betText = this.add.bitmapText(0, 0, 'arcade', '', 20)
    this.highScoreText = this.add.bitmapText(0, 0, 'arcade', '', 20)

    this.updateMoneyText()
    this.updateBetText()
    this.updateHighScoreText()
  }

  private updateHighScoreText() {
    ;(this.highScoreText as BitmapText).setText(`High score: $${100}`)
    Phaser.Display.Align.In.TopCenter(
      <BitmapText>this.highScoreText,
      this.gameZone as Zone,
      200,
      200,
    )
  }

  public updateMoneyText(): void {
    ;(this.moneyText as BitmapText).setText(`Money: $${this.money}`)
    Phaser.Display.Align.In.TopRight(this.moneyText as BitmapText, this.gameZone as Zone, -20, -20)
  }

  // clearボタンとdealボタン
  public setUpButtons(): void {
    const clearButton = new Button(this, 0, this.height * 0.75, 'chipBlue', 'clear')
    const dealButton = new Button(this, 200, this.height * 0.75, 'chipBlue', 'Deal')
    clearButton.on(
      'pointerdown',
      () => {
        this.bet = 0
        this.sound.play('clear', { volume: 0.1 })
        this.updateBetText()
      },
      this,
    )
    dealButton.on(
      'pointerdown',
      () => {
        this.sound.play('bet')
        this.scene.start('Blackjack')
      },
      this,
    )
    const buttons: Image[] = new Array<Image>()
    buttons.push(clearButton)
    buttons.push(dealButton)
    ImageUtility.spaceOutImagesEvenlyHorizontally(buttons, this.scene)
  }
}
