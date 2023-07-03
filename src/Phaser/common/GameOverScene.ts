import BaseScene from '@/Phaser/common/BaseScene'
import Button from '@/Phaser/common/button'
import { textStyle } from '@/utility/constants'

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
    this.add.text(width * 0.5, height * 0.5, 'Game Over!', textStyle).setOrigin(0.5)
    this.RestartButton = new Button(this, width / 2, height * 0.75, 'chipOrange', 'Back')

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
