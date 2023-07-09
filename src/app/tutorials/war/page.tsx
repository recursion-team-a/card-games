import tutorials from '@/app/tutorials/tutorials'
import { Tutorials } from '@/components/Tutorials'

const page = () => <Tutorials title={tutorials.war.title} embedLink={tutorials.war.embedLink} />

export default page
