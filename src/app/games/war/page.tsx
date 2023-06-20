'use client'

import Phaser from 'phaser'
import React, { useEffect } from 'react'
import gameConfig from '@/Phaser/war/config'

function GamePage() {
  useEffect(() => {
    const game = new Phaser.Game(gameConfig)

    return () => {
      game.destroy(true)
    }
  }, [])

  return <div id='phaser-war-game' />
}

export default GamePage
