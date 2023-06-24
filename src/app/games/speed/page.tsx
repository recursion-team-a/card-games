'use client'

import Phaser from 'phaser'
import React, { useEffect } from 'react'
import gameConfig from '@/Phaser/speed/config'

function GamePage() {
  useEffect(() => {
    const game = new Phaser.Game(gameConfig)

    return () => {
      game.destroy(true)
    }
  }, [])

  return <div id='phaser-speed-game' />
}

export default GamePage
