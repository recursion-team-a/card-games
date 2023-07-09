import games from '@/app/games.json'
import Rules from '@/components/Rules'

const page = () => <Rules game={games[0]} />

export default page
