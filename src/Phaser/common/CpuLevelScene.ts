import PreloadScene from '@/Phaser/common/PreloadScene'
import Button from '@/Phaser/common/button'
import CpuLevel from '@/model/common/cpuLevel'
import ImageUtility from '@/utility/ImageUtility'

export default class CpuLevelScene extends PreloadScene {
  constructor() {
    super({ key: 'CpuLevelScene' })
  }

  public gameZone?: Phaser.GameObjects.Zone

  protected easyButton: Button | undefined

  protected normalButton: Button | undefined

  protected hardButton: Button | undefined

  public height: number = 1000

  public width: number = 1000

  public create() {
    const { width, height } = this.sys.game.canvas
    this.height = height
    this.width = width
    const table = this.add.image(this.width / 2, this.height / 2, 'betTable')
    const tableScaleX = this.width / table.width
    const tableScaleY = this.height / table.height
    const tableScale = Math.max(tableScaleX, tableScaleY)
    table.setScale(tableScale)

    this.gameZone = this.add.zone(this.width * 0.5, this.height * 0.5, this.width, this.height)

    const button = this.add.image(100, 100, 'back')
    const buttonScale = Math.min(this.width / 1920, this.height / 1080) * 1.5
    button.setScale(buttonScale)

    button.setInteractive()

    button.on('pointerdown', () => {
      window.location.href = '/studio'
    })

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
    this.scene.start('Speed')
  }

  private handleNormal(): void {
    this.registry.set('cpuLevel', CpuLevel.NORMAL)
    this.scene.start('Speed')
  }

  private handleHard(): void {
    this.registry.set('cpuLevel', CpuLevel.HARD)
    this.scene.start('Speed')
  }
}
