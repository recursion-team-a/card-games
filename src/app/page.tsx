import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <div className='relative flex min-h-screen flex-col space-y-10 justify-center overflow-hidden py-6 sm:py-12'>
        <h1 className='w-max mx-auto text-4xl font-bold'>CARD GAME STUDIO</h1>
        <Link href='/studio' legacyBehavior>
          <button
            type='button'
            className='bg-gradient-to-b w-max mx-auto text-blue-500 font-semibold from-slate-50 to-blue-100 px-20 py-5 rounded-2xl shadow-blue-400 shadow-md border-b-4 hover border-b border-blue-200 hover:shadow-sm transition-all duration-500'
          >
            PLAY
          </button>
        </Link>
      </div>
    </div>
  )
}
