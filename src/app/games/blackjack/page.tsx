'use client'

import Phaser from 'phaser'
import React, { useEffect } from 'react'
import { gameConfig } from '../../../Phaser/config'

const GamePage: React.FC = () => {
  useEffect(() => {
    const game = new Phaser.Game(gameConfig)

    return () => {
      game.destroy(true)
    }
  }, [])

  return <div id='phaser-game' />
}

export default GamePage
