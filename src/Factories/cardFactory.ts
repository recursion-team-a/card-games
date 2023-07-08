import { Scene } from 'phaser'

export const CARD_ATLAS_KEY = 'cards'
export const CARD_HEIGHT = 190
export const CARD_WIDTH = 140

export const TEXAS_CARD_HEIGHT = 142
export const TEXAS_CARD_WIDTH = 105

export class CardFactory {
  constructor(scene: Scene, textureUrl: string, atlasUrl: string) {
    scene.load.atlasXML(CARD_ATLAS_KEY, textureUrl, atlasUrl)
  }
}
