import Link from 'next/link'

interface GameLinkProps {
  title: string
  ruleLink: string
  playLink: string
}

function GameLink({ title, ruleLink, playLink }: GameLinkProps) {
  return (
    <div className='flex border-4 border-black flex-col p-8 rounded-xl bg-white shadow-xl translate-x-4 translate-y-4 w-96 md:w-auto'>
      <div className='mt-3 font-semibold text-xl text-center'>{title}</div>
      <Link href={ruleLink} legacyBehavior>
        <button
          type='button'
          className='bg-[#F4F5FA] border-2 border-black px-4 py-3 rounded-full text-center border border-[#F0F0F6] text-base shadow-xl mt-14 hover:bg-gray-200'
        >
          RULE
        </button>
      </Link>
      <button
        type='button'
        className='bg-[#F4F5FA] border-2 border-black px-2 py-3 rounded-full border border-[#F0F0F6] text-base shadow-xl mt-4 hover:bg-gray-200'
      >
        TUTORIAL
      </button>
      <Link href={playLink} legacyBehavior>
        <button
          type='button'
          className='bg-[#ff0000] border-2 border-black px-4 py-3 rounded-full border border-[#F0F0F6] text-base shadow-xl mt-4 hover:bg-red-600'
        >
          PLAY
        </button>
      </Link>
    </div>
  )
}

export default GameLink
