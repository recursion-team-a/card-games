import tutorials from '@/app/tutorials/tutorials'
import { Tutorials } from '@/components/Tutorials'

const page = () => <Tutorials title={tutorials.speed.title} embedLink={tutorials.speed.embedLink} />

export default page
