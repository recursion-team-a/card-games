import Phaser from 'phaser'
import ContinueScene from '@/Phaser/common/ContinueScene'
import WarScene from '@/Phaser/war/WarScene'

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-war-game',
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'phaser-war-game',
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
  scene: [WarScene, ContinueScene],
}

export default gameConfig
