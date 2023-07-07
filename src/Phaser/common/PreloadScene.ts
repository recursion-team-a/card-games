import * as path from 'path'
import { CARD_ATLAS_KEY } from '@/Factories/cardFactory'
import { loadText } from '@/utility/constants'

export default class PreloadScene extends Phaser.Scene {
  private progressBox: Phaser.GameObjects.Graphics | null = null

  private progressBar: Phaser.GameObjects.Graphics | null = null

  private loadingText: Phaser.GameObjects.Text | null = null

  private percentText: Phaser.GameObjects.Text | null = null

  public bitmapText: Phaser.GameObjects.BitmapText | undefined

  public preload() {
    const { width, height } = this.cameras.main
    // ロードバーの背景
    this.progressBox = this.add.graphics()
    this.progressBox.fillStyle(0x222222, 0.8)
    this.progressBox.fillRect(width / 2 - 300, height / 2 - 120, 600, 240)

    // ロードバーを作成
    this.progressBar = this.add.graphics()

    // テキスト
    this.loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: loadText,
    })
    this.loadingText.setOrigin(0.5, 0.5)

    this.percentText = this.make.text({
      x: width / 2,
      y: height / 2 + 30,
      text: '0%',
      style: loadText,
    })
    this.percentText.setOrigin(0.5, 0.5)

    // ロードイベント
    this.load.on('progress', (value: number) => {
      if (this.percentText && this.progressBar) {
        this.percentText.setText(`${Math.floor(value * 100)}%`)
        this.progressBar.clear()
        this.progressBar.fillStyle(0xffffff, 1)
        this.progressBar.fillRect(width / 2 - 150, height / 2 - 30, 300 * value, 30)
      }
    })

    this.load.on('complete', () => {
      if (this.progressBox && this.progressBar && this.loadingText && this.percentText) {
        this.progressBar.destroy()
        this.progressBox.destroy()
        this.loadingText.destroy()
        this.percentText.destroy()
      }
    })

    // アセットの読み込み
    this.load.atlasXML(
      CARD_ATLAS_KEY,
      path.join('/assets/Cards', 'playingCards.png'),
      path.join('/assets/Cards', 'playingCards.xml'),
    )
    this.load.bitmapFont(
      'arcade',
      path.join('/assets/fonts', 'arcade.png'),
      path.join('/assets/fonts', 'arcade.xml'),
    )
    this.load.audio('negative', path.join('/assets/sounds', 'negative-tone.wav'))
    this.load.audio('countDown', path.join('/assets/sounds', 'countDown.wav'))
    this.load.audio('bet', path.join('/assets/sounds', 'bet.wav'))
    this.load.audio('click', path.join('/assets/sounds', 'click.wav'))
    this.load.audio('cardflip', path.join('/assets/sounds', 'cardflip.mp3'))
    this.load.audio('clear', path.join('/assets/sounds', 'clear.mp3'))
    this.load.audio('coin', path.join('/assets/sounds', 'coin.wav'))
    this.load.audio('deal', path.join('/assets/sounds', 'deal.wav'))
    this.load.audio('kosh', path.join('/assets/sounds', 'kosh.wav'))
    this.load.audio('win', path.join('/assets/sounds', 'win.wav'))
    this.load.audio('shuffle1', path.join('/assets/sounds', 'shuffle1.wav'))
    this.load.audio('shuffle2', path.join('/assets/sounds', 'shuffle2.wav'))
    this.load.audio('thock', path.join('/assets/sounds', 'thock.wav'))
    this.load.image('cardBack', path.join('/assets/Cards', 'cardBack.png'))
    this.load.image('chipYellow', path.join('/assets/Chips', 'chipYellow.png'))
    this.load.image('chipOrange', path.join('/assets/Chips', 'chipOrange.png'))
    this.load.image('chipRed', path.join('/assets/Chips', 'chipRed.png'))
    this.load.image('chipGray', path.join('/assets/Chips', 'chipGray.png'))
    this.load.image('chipBlue', path.join('/assets/Chips', 'chipBlue.png'))
    this.load.image('back', path.join('/assets/ui/buttons', 'back.png'))
    this.load.image('rectangleButton', path.join('/assets/ui/buttons', 'rectangleButton.png'))
    this.load.image('squareButton', path.join('/assets/ui/buttons', 'squareButton.png'))
    this.load.image('blueEmptyButton', path.join('/assets/ui/buttons', 'blueEmptyButton.png'))
    this.load.image('blackButton', path.join('/assets/ui/buttons', 'blackButton.png'))
    this.load.image('grayButton', path.join('/assets/ui/buttons', 'grayButton.png'))
    this.load.image('largeGrayButton', path.join('/assets/ui/buttons', 'largeGrayButton.png'))
    this.load.image(
      'extraLargeGrayButton',
      path.join('/assets/ui/buttons', 'extraLargeGrayButton.png'),
    )
    this.load.image('largeRedButton', path.join('/assets/ui/buttons', 'largeRedButton.png'))
    this.load.image('darkRedButton', path.join('/assets/ui/buttons', 'darkRedButton.png'))
    this.load.image('greenButton', path.join('/assets/ui/buttons', 'greenButton.png'))
    this.load.image('orangeButton', path.join('/assets/ui/buttons', 'orangeButton.png'))
    this.load.image('table', path.join('/assets/ui/table', 'table.jpg'))
    this.load.image('betTable', path.join('/assets/ui/table', 'betTable.jpg'))
  }
}
