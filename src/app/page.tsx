'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'

export default function Home() {
  const [windowWidth, setWindowWidth] = useState(globalThis.window?.innerWidth)
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const getFontSize = () => {
    if (windowWidth < 600) {
      return 'text-6xl'
    }
    return 'text-8xl'
  }

  const fontSizeClass = getFontSize()

  return (
    <div
      style={{
        backgroundImage: "url('/assets/title.jpg')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className='relative flex min-h-screen flex-col space-y-10 justify-center overflow-hidden py-6 sm:py-12'>
        <h1 className={`w-max mx-auto ${fontSizeClass} font-bold`}>CARD GAME STUDIO</h1>
        <Link href='/studio' legacyBehavior>
          <button
            type='button'
            className='start-btn bg-gradient-to-b w-max mx-auto text-xl text-gray-500 font-semibold from-slate-50 to-gray-100 px-20 py-5 rounded-2xl  border-b-4 border-gray-200 transition-all'
          >
            PLAY
          </button>
        </Link>
      </div>
    </div>
  )
}
