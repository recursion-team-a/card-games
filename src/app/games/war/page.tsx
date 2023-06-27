'use client'

import React, { useEffect } from 'react'

function GamePage() {
  useEffect(() => {
    ;(async () => {
      const Phaser = await import('phaser')
      const gameConfig = (await import('@/Phaser/war/config')).default
      const game = new Phaser.Game(gameConfig)

      return () => {
        game.destroy(true)
      }
    })()
  }, [])

  return <div id='phaser-war-game' />
}

export default GamePage
