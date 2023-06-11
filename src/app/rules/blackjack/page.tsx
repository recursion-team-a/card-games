import Rules from '../../../components/Rules'
import { games } from '@/app/games'

const page = () => {
  return (
    <>
      <Rules game={games[1]} />
    </>
  )
}

export default page
