import Link from 'next/link'
import React from 'react'

interface RulesProps {
  game: {
    title: string
    desc: string
  } // ゲームの配列の型を指定する
}

const Rules: React.FC<RulesProps> = ({ game }) => {
  return (
    <>
      <div className='fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50 py-10'>
        <div className='max-h-full w-full max-w-3xl overflow-y-auto sm:rounded-2xl bg-white'>
          <div className='w-full'>
            <div className='m-8 my-20 max-w-[600px] mx-auto'>
              <div className='mb-8'>
                <React.Fragment>
                  <h1 className='mb-4 text-3xl font-extrabold text-center'>{game.title}</h1>
                  <p className='text-gray-600'>{game.desc}</p>
                </React.Fragment>
              </div>
              <div className='space-y-4'>
                <Link href='/studio'>
                  <button className='p-3 bg-black rounded-full text-white w-full font-semibold'>
                    Okay
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Rules
