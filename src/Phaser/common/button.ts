import Phaser from 'phaser'
import { textStyle } from '../../utility/constants'
import Text = Phaser.GameObjects.Text

export default class Button extends Phaser.GameObjects.Image {
  key: string

  initScale: number

  text: Text

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

  setUpHoverButtons(): void {
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

  setX(x: number): any {
    super.setX(x)
    Phaser.Display.Align.In.Center(this.text, this)
  }

  destroy(): void {
    this.text.destroy()
    super.destroy()
  }
}
