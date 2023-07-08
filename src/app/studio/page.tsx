'use client'

import React from 'react'
import games from '../games.json'
import Slider from './slider'

export default function Studio() {
  return (
    <>
      <div className='studio'>
        <div className='title text-6xl max-w-xl font-bold'>SELECT GAME</div>
      </div>
      <Slider games={games} />
    </>
  )
}
