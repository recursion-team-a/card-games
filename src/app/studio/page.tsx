import { games } from '../games'
import GameLink from './GameLink'

export default function Studio() {
  return (
    <div className='flex items-center justify-center flex-col min-h-screen'>
      <div className='bg-[#F4F5FA] p-10 rounded-xl'>
        <div className='flex flex-col justify-center items-center text-center'>
          <div className='text-4xl max-w-xl font-bold font-sans'>SELECT GAME</div>
        </div>

        <div className='flex flex-col md:flex-row space-x-0 md:space-x-8 space-y-12 md:space-y-0 justify-center items-center mt-10'>
          {games.map((game, index) => (
            <GameLink key={index} {...game} />
          ))}
        </div>

        <div className='flex justify-center mt-12'></div>
      </div>
    </div>
  )
}
