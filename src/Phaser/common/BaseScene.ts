import Text = Phaser.GameObjects.Text
import Image = Phaser.GameObjects.Image
import Zone = Phaser.GameObjects.Zone
import GameObject = Phaser.GameObjects.GameObject
import BetScene from '@/Phaser/BetScene'
import PreloadScene from '@/Phaser/PreloadScene'
import Deck from '@/Phaser/common/DeckImage'
import { textStyle } from '@/utility/constants'

export default class BaseScene extends PreloadScene {
  protected deck: Deck | undefined

  protected moneyText: Text | undefined

  protected betText: Text | undefined

  protected timerText: Text | undefined

  protected gameZone: Zone | undefined

  protected faceDownImage: Image | undefined

  protected CARD_FLIP_TIME = 600

  protected INITIAL_TIME = 2

  public betScene: BetScene | undefined

  createField() {
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

    this.INITIAL_TIME = 2

    button.on('pointerdown', () => {
      window.location.href = '/studio'
    })
    this.gameZone = this.add.zone(width * 0.5, height * 0.5, width, height)
  }

  public updateMoneyText(): void {
    ;(this.moneyText as Text).setText(`Money: $${(<BetScene>this.betScene).money}`)
    Phaser.Display.Align.In.TopRight(this.moneyText as Text, this.gameZone as Zone, -20, -20)
  }

  public updateBetText() {
    ;(this.betText as Text).setText(`Bet: $${(<BetScene>this.betScene).bet}`)
    Phaser.Display.Align.To.BottomLeft(this.betText as Text, this.moneyText as Text)
  }

  public createCardTween(image: Image, x: number, y: number, duration: number = 500) {
    this.tweens.add({
      targets: image,
      x,
      y,
      duration,
      ease: 'Linear',
    })
  }

  public setUpMoneyText(): void {
    this.moneyText = this.add.text(0, 0, '', textStyle)
    this.betText = this.add.text(0, 0, '', textStyle)

    this.updateMoneyText()
    this.updateBetText()
  }

  public flipOverCard(cardBack: Image, cardFront: Image) {
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

  protected countDown(callback: () => void) {
    this.INITIAL_TIME -= 1
    if (this.INITIAL_TIME > 0) {
      this.setTimerText(`${String(this.INITIAL_TIME)}`)
    } else if (this.INITIAL_TIME === 0) {
      this.setTimerText('START')
      Phaser.Display.Align.In.Center(this.timerText as Text, this.gameZone as GameObject, 0, -20)
    } else {
      this.setTimerText('')
      callback()
    }
  }

  protected createTimerText(): void {
    this.timerText = this.add.text(0, 0, '', textStyle)
    this.setTimerText(`${String(this.INITIAL_TIME)}`)
    Phaser.Display.Align.In.Center(this.timerText as Text, this.gameZone as GameObject, 0, -20)
  }

  protected setTimerText(time: string): void {
    if (this.timerText) this.timerText.setText(`${time}`)
  }
}
