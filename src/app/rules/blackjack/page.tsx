import { games } from '@/app/games'
import Rules from '@/components/Rules'

const page = () => {
  return (
    <>
      <Rules game={games[1]} />
    </>
  )
}

export default page
