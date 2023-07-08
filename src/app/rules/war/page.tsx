import games from '@/app/games.json'
import Rules from '@/components/Rules'

const page = () => <Rules game={games[3]} />

export default page
