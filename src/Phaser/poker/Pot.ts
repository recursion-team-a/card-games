import Phaser from 'phaser'
import BitmapText = Phaser.GameObjects.BitmapText

const MOVE_TIME = 200

export default class Pot extends Phaser.GameObjects.Image {
  public key: string | undefined

  public initScale: number | undefined

  public text: BitmapText | undefined

  public potAmount: number | undefined

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    potAmount: number,
    key = `POT: ${0}`,
  ) {
    super(scene, x, y, texture, potAmount)
    scene.add.existing(this)

    this.potAmount = 0
    this.key = key
    this.initScale =
      Number(scene.scene.manager.game.config.height) / 1100 >= 1
        ? Number(scene.scene.manager.game.config.height) / 1100
        : 1
    this.text = this.scene.add.bitmapText(0, 0, 'arcade', this.key, 15)

    this.key = `POT: ${potAmount}`
    this.text.setFontSize(20)
    Phaser.Display.Align.In.BottomCenter(this.text, this)
    this.setScale(this.initScale * 0.6)
    this.setDataEnabled()
  }

  public destroy(): void {
    if (this.text !== undefined) this.text.destroy()
    super.destroy()
  }

  public setAmount(amount: number): void {
    if (this.potAmount !== undefined) this.potAmount += amount
    if (this.text !== undefined) this.text.setText(`POT: ${this.potAmount}`)
  }

  public getAmount(): number | undefined {
    return this.potAmount
  }

  public clear(): void {
    this.potAmount = 0
  }

  public playMoveTween(toX: number, toY: number): void {
    this.scene.tweens.add({
      targets: this,
      x: toX,
      y: toY,
      duration: MOVE_TIME,
      ease: 'Linear',
    })
  }
}
