import BaseScene from '@/Phaser/common/BaseScene'
import Button from '@/Phaser/common/button'
import CpuLevel from '@/model/common/cpuLevel'
import ImageUtility from '@/utility/ImageUtility'

export default class CpuLevelScene extends BaseScene {
  constructor() {
    super({ key: 'CpuLevelScene' })
  }

  protected easyButton: Button | undefined

  protected normalButton: Button | undefined

  protected hardButton: Button | undefined

  public create() {
    this.createField()

    this.createButton()
  }

  private createButton(): void {
    const { height } = this.sys.game.canvas
    this.easyButton = new Button(this, 0, height / 2, 'chipOrange', 'easy')
    this.normalButton = new Button(this, 0, height / 2, 'chipYellow', 'normal')
    this.hardButton = new Button(this, 0, height / 2, 'chipRed', 'hard')

    const buttons: Button[] = new Array<Button>()
    buttons.push(this.easyButton)
    buttons.push(this.normalButton)
    buttons.push(this.hardButton)

    ImageUtility.spaceOutImagesEvenlyHorizontally(buttons, this.scene)
    this.setUpClickHandler(this.easyButton, this.handleEasy.bind(this))
    this.setUpClickHandler(this.normalButton, this.handleNormal.bind(this))
    this.setUpClickHandler(this.hardButton, this.handleHard.bind(this))
  }

  private setUpClickHandler(button: Button, handlerFunction: Function) {
    button.on('pointerdown', () => {
      handlerFunction.call(this)
    })
  }

  private handleEasy(): void {
    this.registry.set('cpuLevel', CpuLevel.EASY)
    this.scene.start('Speed') // 要変更
  }

  private handleNormal(): void {
    this.registry.set('cpuLevel', CpuLevel.NORMAL)
    this.scene.start('Speed') // 要変更
  }

  private handleHard(): void {
    this.registry.set('cpuLevel', CpuLevel.HARD)
    this.scene.start('Speed') // 要変更
  }
}
