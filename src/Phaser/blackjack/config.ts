import Phaser from 'phaser'
import Blackjack from '@/Phaser/blackjack/BlackjackScene'
import BetScene from '@/Phaser/common/BetScene'
import ContinueScene from '@/Phaser/common/ContinueScene'
import GameOverScene from '@/Phaser/common/GameOverScene'

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-blackjack-game',
  scale: {
    mode: Phaser.Scale.FIT,
    parent: 'phaser-blackjack-game',
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
  scene: [BetScene, Blackjack, ContinueScene, GameOverScene],
}

export default gameConfig
