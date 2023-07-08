'use client'

import React from 'react'
import Slider from './slider'
import games from '@/app/games.json'

export default function hub() {
  return (
    <>
      <div className='hub'>
        <div className='title text-6xl max-w-xl font-bold'>SELECT GAME</div>
      </div>
      <Slider games={games} />
    </>
  )
}
