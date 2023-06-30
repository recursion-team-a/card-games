import Phaser from 'phaser'
import { textStyle } from '../../utility/constants'
import Text = Phaser.GameObjects.Text

export default class Button extends Phaser.GameObjects.Image {
  public key: string

  public initScale: number

  public text: Text

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    key: string = '',
    value: number = 0,
  ) {
    super(scene, x, y, texture)
    scene.add.existing(this)

    this.key = key
    this.initScale = 0.7
    this.text = this.scene.add.text(0, 0, this.key, textStyle)
    Phaser.Display.Align.In.Center(this.text, this)

    this.setScale(this.initScale)
    this.setInteractive()
    this.setDataEnabled()
    this.data.set('value', value)
    this.setUpHoverButtons()
  }

  public setUpHoverButtons(): void {
    this.on(
      'pointerover',
      () => {
        this.setScale(1.2 * this.initScale)
      },
      this,
    )
    this.on(
      'pointerout',
      () => {
        this.setScale(this.initScale)
      },
      this,
    )
  }

  public setX(x: number): any {
    super.setX(x)
    Phaser.Display.Align.In.Center(this.text, this)
  }

  public destroy(): void {
    this.text.destroy()
    super.destroy()
  }

  public setClickHandler(pushHandler: () => void): void {
    this.on(
      'pointerdown',
      () => {
        pushHandler()
      },
      this,
    )
  }

  public resizeButton(scale: number): void {
    if (scale < 0) {
      throw new Error('Scale value cannot be negative.')
    }
    this.setScale(this.initScale * scale)
  }

  public playMoveAndDestroy(toX: number, toY: number): void {
    this.scene.tweens.add({
      targets: this,
      x: toX,
      y: toY,
      duration: 200,
      ease: 'Linear',
      onComplete: () => {
        this.destroy()
      },
    })
  }
}
