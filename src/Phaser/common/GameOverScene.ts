import BaseScene from '@/Phaser/common/BaseScene'
import Button from '@/Phaser/common/button'

export default class GameOverScene extends BaseScene {
  constructor() {
    super({ key: 'GameOverScene' })
  }

  protected RestartButton: Button | undefined

  public create() {
    this.createField()

    this.createButton()
  }

  private createButton() {
    const { width, height } = this.scale
    this.sound.play('negative')
    this.add.bitmapText(width * 0.5, height * 0.5, 'arcade', 'Game Over!', 30).setOrigin(0.5)
    this.RestartButton = new Button(this, width / 2, height * 0.75, 'grayButton', 'BACK')

    this.setUpClickHandler(this.RestartButton, GameOverScene.handleRestartButton.bind(this))
  }

  private setUpClickHandler(button: Button, handlerFunction: Function) {
    button.on('pointerdown', () => {
      handlerFunction.call(this)
    })
  }

  private static handleRestartButton(): void {
    window.location.href = '/studio'
  }
}
