import * as path from 'path'
import { CARD_ATLAS_KEY } from '@/Factories/cardFactory'
import { loadText } from '@/utility/constants'

export default class PreloadScene extends Phaser.Scene {
  public preload() {
    const { width, height } = this.cameras.main
    // ロードバーの背景
    const progressBox = this.add.graphics()
    progressBox.fillStyle(0x222222, 0.8)
    progressBox.fillRect(width / 2 - 300, height / 2 - 120, 600, 240)

    // ロードバーを作成
    const progressBar = this.add.graphics()

    // テキスト
    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: loadText,
    })
    loadingText.setOrigin(0.5, 0.5)

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2 + 30,
      text: '0%',
      style: loadText,
    })
    percentText.setOrigin(0.5, 0.5)

    // ロードイベント
    this.load.on('progress', (value: number) => {
      percentText.setText(`${Math.floor(value * 100)}%`)
      progressBar.clear()
      progressBar.fillStyle(0xffffff, 1)
      progressBar.fillRect(width / 2 - 150, height / 2 - 30, 300 * value, 30)
    })

    this.load.on('complete', () => {
      progressBar.destroy()
      progressBox.destroy()
      loadingText.destroy()
      percentText.destroy()
    })

    // アセットの読み込み
    this.load.atlasXML(
      CARD_ATLAS_KEY,
      path.join('/assets/Cards', 'playingCards.png'),
      path.join('/assets/Cards', 'playingCards.xml'),
    )
    this.load.image('table', path.join('/assets', 'table.jpg'))
    this.load.image('betTable', path.join('/assets', 'betTable.jpg'))
    this.load.image('cardBack', path.join('/assets/Cards', 'cardBack.png'))
    this.load.image('chipYellow', path.join('/assets/Chips', 'chipYellow.png'))
    this.load.image('chipOrange', path.join('/assets/Chips', 'chipOrange.png'))
    this.load.image('chipRed', path.join('/assets/Chips', 'chipRed.png'))
    this.load.image('chipWhite', path.join('/assets/Chips', 'chipWhite.png'))
    this.load.image('chipBlue', path.join('/assets/Chips', 'chipBlue.png'))
    this.load.image('back', path.join('/assets', 'back.png'))
  }
}
