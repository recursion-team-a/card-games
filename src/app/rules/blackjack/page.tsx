import games from '@/app/games.json'
import Rules from '@/components/Rules'

const page = () => <Rules game={games[1]} />

export default page
