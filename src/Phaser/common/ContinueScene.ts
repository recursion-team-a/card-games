import BaseScene from '@/Phaser/common/BaseScene'
import Button from '@/Phaser/common/button'
import ImageUtility from '@/utility/ImageUtility'

export default class ContinueScene extends BaseScene {
  constructor() {
    super({ key: 'ContinueScene' })
  }

  private nextScene: string | undefined

  protected YesButton: Button | undefined

  protected NoButton: Button | undefined

  init(data: { nextScene: string }) {
    this.nextScene = data.nextScene
  }

  public create() {
    this.createField()

    this.createButton()
  }

  private createButton() {
    const { width, height } = this.scale
    this.add.bitmapText(width * 0.5, height * 0.5, 'arcade', 'Continue?', 25).setOrigin(0.5)
    this.YesButton = new Button(this, 0, height * 0.75, 'grayButton', 'Yes')
    this.NoButton = new Button(this, 0, height * 0.75, 'grayButton', 'No')

    const buttons: Button[] = new Array<Button>()
    buttons.push(this.YesButton)
    buttons.push(this.NoButton)

    ImageUtility.spaceOutImagesEvenlyHorizontally(buttons, this.scene)
    this.setUpClickHandler(this.YesButton, this.handleYesButton.bind(this))
    this.setUpClickHandler(this.NoButton, ContinueScene.handleNoButton.bind(this))
  }

  private setUpClickHandler(button: Button, handlerFunction: Function) {
    button.on('pointerdown', () => {
      this.sound.play('click')
      handlerFunction.call(this)
    })
  }

  private handleYesButton(): void {
    this.scene.start(this.nextScene)
  }

  private static handleNoButton(): void {
    window.location.href = '/studio'
  }
}
