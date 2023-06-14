import path from 'path'
import Phaser from 'phaser'

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene', active: true })
  }

  preload(): void {
    this.load.image('betTable', path.join('/assets', 'betTable.jpg'))
    this.load.image('chipYellow', path.join('/assets', 'chipYellow.png'))
    this.load.image('backButton', path.join('/assets', 'backButton.jpeg'))
  }

  create(): void {
    const { width, height } = this.sys.game.canvas

    const table = this.add.image(width / 2, height / 2, 'betTable')
    const chip = this.add.image(500, 600, 'chipYellow')
    const button = this.add.image(100, 100, 'backButton')

    const tableScaleX = width / table.width
    const tableScaleY = height / table.height
    const tableScale = Math.max(tableScaleX, tableScaleY)
    table.setScale(tableScale)

    const chipScale = Math.min(width / 1920, height / 1080)
    chip.setScale(chipScale)

    const buttonScale = Math.min(width / 1920, height / 1080) * 0.3
    button.setScale(buttonScale)

    button.setInteractive()

    button.on('pointerdown', () => {
      window.location.href = '/studio'
    })

    const clickButton = this.add.text(width / 2, 400, 'START TO CLICK', {
      color: '#0f0',
    })
    clickButton.setOrigin(0.5, 0.5)
    clickButton.setStroke('#0000ff', 4)
    clickButton.setFontSize(Math.floor(Math.min(width / 1920, height / 1080) * 40)) // 画面サイズに合わせてフォントサイズを調整
    clickButton.setInteractive()
    clickButton.on('pointerdown', () => {
      this.scene.start('MainScene')
    })
  }
}
