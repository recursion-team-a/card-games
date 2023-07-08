import tutorials from '@/app/tutorials/tutorials'
import { Tutorials } from '@/components/Tutorials'

const page = () => (
  <Tutorials title={tutorials.blackjack.title} embedLink={tutorials.blackjack.embedLink} />
)

export default page
