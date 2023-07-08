import BitmapText = Phaser.GameObjects.BitmapText
import Image = Phaser.GameObjects.Image
import Zone = Phaser.GameObjects.Zone
import GameObject = Phaser.GameObjects.GameObject
import BetScene from '@/Phaser/common/BetScene'
import Deck from '@/Phaser/common/DeckImage'
import PreloadScene from '@/Phaser/common/PreloadScene'

export default class BaseScene extends PreloadScene {
  protected deck: Deck | undefined

  protected moneyText: BitmapText | undefined

  protected betText: BitmapText | undefined

  protected timerText: BitmapText | undefined

  protected gameZone: Zone | undefined

  protected faceDownImage: Image | undefined

  protected CARD_FLIP_TIME = 600

  protected INITIAL_TIME = 3

  public betScene: BetScene | undefined

  public createField() {
    const { width, height } = this.sys.game.canvas
    this.add.image(100, 300, 'table')
    const table = this.add.image(width / 2, height / 2, 'table')
    const scaleX = width / table.width
    const scaleY = height / table.height
    const scale = Math.max(scaleX, scaleY)
    table.setScale(scale).setScrollFactor(0)
    const button = this.add.image(100, 100, 'homeButton')
    const buttonScale = Math.min(width / 1920, height / 1080) * 1.5
    button.setScale(buttonScale)

    button.setInteractive()

    this.INITIAL_TIME = 3

    button.on('pointerdown', () => {
      window.location.href = '/studio'
    })
    this.gameZone = this.add.zone(width * 0.5, height * 0.5, width, height)
  }

  public updateMoneyText(): void {
    ;(this.moneyText as BitmapText).setText(`Money: $${(<BetScene>this.betScene).money}`)
    Phaser.Display.Align.In.TopRight(this.moneyText as BitmapText, this.gameZone as Zone, -20, -20)
  }

  public updateBetText() {
    ;(this.betText as BitmapText).setText(`Bet: $${(<BetScene>this.betScene).bet}`)
    Phaser.Display.Align.To.BottomLeft(this.betText as BitmapText, this.moneyText as BitmapText)
  }

  public setUpMoneyText(): void {
    this.moneyText = this.add.bitmapText(0, 0, 'arcade', '', 20)
    this.betText = this.add.bitmapText(0, 0, 'arcade', '', 20)

    this.updateMoneyText()
    this.updateBetText()
  }

  protected countDown(callback: () => void) {
    this.INITIAL_TIME -= 1
    if (this.INITIAL_TIME > 0) {
      this.setTimerText(`${String(this.INITIAL_TIME)}`)
    } else if (this.INITIAL_TIME === 0) {
      this.setTimerText('START')
      Phaser.Display.Align.In.Center(
        this.timerText as BitmapText,
        this.gameZone as GameObject,
        0,
        -20,
      )
    } else {
      this.setTimerText('')
      callback()
    }
  }

  protected createTimerText(): void {
    this.timerText = this.add.bitmapText(0, 0, 'arcade', '', 30)
    this.setTimerText(`${String(this.INITIAL_TIME)}`)
    Phaser.Display.Align.In.Center(
      this.timerText as BitmapText,
      this.gameZone as GameObject,
      0,
      -20,
    )
  }

  protected setTimerText(time: string): void {
    if (this.timerText) this.timerText.setText(`${time}`)
  }

  protected gameOver() {
    this.scene.start('GameOverScene')
  }
}
