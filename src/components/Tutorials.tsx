import Link from 'next/link'
import React from 'react'

interface TutorialProps {
  title: string
  embedLink: string
}

function Tutorials(tutorial: TutorialProps) {
  const { title, embedLink } = tutorial
  return (
    <div className='fixed inset-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50 py-10'>
      <div className='max-h-full w-full max-w-5xl overflow-y-auto rounded-2xl bg-white'>
        <div className='w-full'>
          <div className='m-5 my-10 max-w-[600px] mx-auto'>
            <div className='mb-7'>
              <h1 data-testid='game-title' className='mb-4 text-5xl font-extrabold text-center'>
                {title}
              </h1>
              <div dangerouslySetInnerHTML={{ __html: embedLink }} />
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

export { Tutorials }
export type { TutorialProps }
