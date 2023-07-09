import tutorials from '@/app/tutorials/tutorials'
import { Tutorials } from '@/components/Tutorials'

const page = () => <Tutorials title={tutorials.poker.title} embedLink={tutorials.poker.embedLink} />

export default page
