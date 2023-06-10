import Rules from '../../../components/Rules'
import { games } from '@/app/games'

const page = () => {
  return (
    <>
      <Rules game={games[3]} />
    </>
  )
}

export default page
