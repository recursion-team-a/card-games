import Link from 'next/link'
import React from 'react'
import '../app/rules/rules.css'

interface Word {
  id: string
  word: string
  description: string
}

interface RulesProps {
  game: {
    title: string
    desc: string
    words?: Word[]
  }
}

function Rules({ game }: RulesProps) {
  return (
    <div className='fixed inset-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50 py-10'>
      <div className='max-h-full w-full max-w-5xl overflow-y-auto rounded-2xl bg-white'>
        <div className='w-full'>
          <div className='m-5 my-10 max-w-[600px] mx-auto'>
            <div className='mb-7'>
              <h1 data-testid='game-title' className='mb-4 text-5xl font-extrabold text-center'>
                {game.title}
              </h1>
              <div>
                <h2 className='mb-4 mt-10 text-lg font-extrabold text-center'>ゲーム説明</h2>
                <p className='text-gray-600'>{game.desc}</p>
              </div>
              {game.words && game.words.length > 0 ? (
                <div>
                  <h2 className='mb-5 mt-10 text-lg font-extrabold text-center'>用語説明</h2>
                  <div className='flex flex-col'>
                    <div className='overflow-x-auto sm:-mx-6 lg:-mx-8'>
                      <div className='inline-block min-w-full py-2 sm:px-6 lg:px-8'>
                        <div className='overflow-hidden'>
                          <table className='min-w-full text-left font-light'>
                            <thead className='border-b font-medium dark:border-neutral-500'>
                              <tr>
                                <th scope='col' className='px-6 py-4 w-20 font-extrabold'>
                                  WORD
                                </th>
                                <th scope='col' className='px-6 py-4 font-extrabold'>
                                  DESCRIPTION
                                </th>
                              </tr>
                            </thead>
                            {game.words.map((word) => (
                              <tbody key={word.id}>
                                <tr className='border-b dark:border-neutral-500'>
                                  <td className='whitespace-nowrap px-6 py-4 font-extrabold'>
                                    {word.word}
                                  </td>
                                  <td className='whitespace-nowrap px-6 py-4'>
                                    {word.description}
                                  </td>
                                </tr>
                              </tbody>
                            ))}
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <div className='space-y-4'>
              <Link href='/hub'>
                <button
                  type='button'
                  className='p-3 bg-black rounded-full text-white w-full font-semibold'
                >
                  Okay
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Rules
