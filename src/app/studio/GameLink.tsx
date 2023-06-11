import Link from 'next/link'

interface GameLinkProps {
  title: string
  ruleLink: string
  playLink: string
}

const GameLink: React.FC<GameLinkProps> = ({ title, ruleLink, playLink }) => {
  return (
    <div className='flex flex-col p-8 rounded-xl bg-white shadow-xl translate-x-4 translate-y-4 w-96 md:w-auto'>
      <div className='mt-3 font-semibold text-xl text-center'>{title}</div>
      <Link href={ruleLink} legacyBehavior>
        <a className='bg-[#F4F5FA] px-4 py-3 rounded-full text-center border border-[#F0F0F6] shadow-xl mt-4'>
          RULE
        </a>
      </Link>
      <button className='bg-[#F4F5FA] px-4 py-3 rounded-full border border-[#F0F0F6] shadow-xl mt-4'>
        TUTORIAL
      </button>
      <Link href={playLink} legacyBehavior>
        <button className='bg-[#f24e4e] px-4 py-3 rounded-full border border-[#F0F0F6] shadow-xl mt-4'>
          PLAY
        </button>
      </Link>
    </div>
  )
}

export default GameLink