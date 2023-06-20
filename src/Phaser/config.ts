import Phaser from 'phaser'
import BetScene from './BetScene'
import MainScene from './MainScene'

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-game',
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'game-content',
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 720,
      height: 345,
    },
    max: {
      width: 1920,
      height: 920,
    },
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
    },
  },
  scene: [BetScene, MainScene],
}

export default gameConfig
