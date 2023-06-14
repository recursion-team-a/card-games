import path from 'path'
import Phaser from 'phaser'

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene', active: false })
  }

  preload(): void {
    this.load.image('table', path.join('/assets', 'table.jpeg'))
    this.load.image('clover4', path.join('/assets/', 'clover4.png'))
    this.load.image('card_back_red', path.join('/assets/', 'card_back_red.png'))
  }

  create(): void {
    this.add.image(100, 300, 'table')

    const { width, height } = this.sys.game.canvas

    const table = this.add.image(width / 2, height / 2, 'table')

    const scaleX = width / table.width
    const scaleY = height / table.height
    const scale = Math.max(scaleX, scaleY)
    table.setScale(scale).setScrollFactor(0)

    const rcard1 = this.add.image(-200, this.cameras.main.centerY, 'card_back_red')
    const rcard2 = this.add.image(-200, this.cameras.main.centerY, 'card_back_red')
    rcard1.setOrigin(0, 0.5)

    const button = this.add.image(100, 100, 'backButton')
    button.setScale(0.15, 0.15)
    button.setInteractive()
    button.on('pointerdown', () => {
      this.scene.start('TitleScene')
    })

    const clickButton = this.add.text(500, 400, 'HIT', {
      color: '#0f0',
    })
    clickButton.setOrigin(0.5, 0.5)
    clickButton.setStroke('#0000ff', 4)
    clickButton.setFontSize('20px')
    clickButton.setInteractive()
    clickButton.on('pointerdown', () => {
      this.tweens.add({
        targets: rcard1,
        x: this.cameras.main.centerX - 10,
        y: this.cameras.main.centerY + 200,
        duration: 1000,
        ease: 'Power1',
        onComplete: () => {
          this.flipCard(rcard1)
        },
      })
    })
    this.tweens.add({
      targets: rcard2,
      x: this.cameras.main.centerX,
      y: this.cameras.main.centerY + 200,
      duration: 1000,
      ease: 'Power1',
      onComplete: () => {
        this.flipCard(rcard2)
      },
    })
  }

  flipCard(card: Phaser.GameObjects.Image) {
    let isFlipped = false
    this.tweens.add({
      targets: card,
      scaleX: 0,
      duration: 500,
      ease: 'Linear',
      onComplete: () => {
        isFlipped = !isFlipped
        card.setTexture(isFlipped ? 'clover4' : 'card_back_red')
        card.setScale(0.2)
      },
    })
  }
}
