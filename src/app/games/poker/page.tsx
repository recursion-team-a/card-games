'use client'

import Phaser from 'phaser'
import React, { useEffect } from 'react'
import gameConfig from '@/Phaser/poker/config'

function GamePage() {
  useEffect(() => {
    const game = new Phaser.Game(gameConfig)

    return () => {
      game.destroy(true)
    }
  }, [])

  return <div id='phaser-poker-game' />
}

export default GamePage
