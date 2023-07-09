import tutorials from '@/app/tutorials/tutorials'
import { Tutorials } from '@/components/Tutorials'

const page = () => (
  <Tutorials
    title={tutorials.texasHoldemPoker.title}
    embedLink={tutorials.texasHoldemPoker.embedLink}
  />
)

export default page
