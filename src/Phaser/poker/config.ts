import Phaser from 'phaser'
import ContinueScene from '@/Phaser/common/ContinueScene'
import GameOverScene from '@/Phaser/common/GameOverScene'
import Poker from '@/Phaser/poker/PokerScene'

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-poker-game',
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'phaser-poker-game',
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
  scene: [Poker, ContinueScene, GameOverScene],
}

export default gameConfig
