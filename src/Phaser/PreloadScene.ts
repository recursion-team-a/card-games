import * as path from 'path'
import { CARD_ATLAS_KEY } from '@/Factories/cardFactory'

export default class PreloadScene extends Phaser.Scene {
  preload() {
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
