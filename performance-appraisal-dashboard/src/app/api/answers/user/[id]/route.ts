import { PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()


// GET /api/answers/user/[id]
// Gets answer by user
export async function GET(req: Request,
    { params }: { params: { id: string }}) {
    try {
        const answers = await getAnswers(params.id)
        
        return new Response(JSON.stringify(answers), 
            {
                status: 200,
                headers: {'Content-Type': 'application/json'}
            }
        )
    } catch (err) {
        console.error('Error: ', err)
        return new Response("Error", {status: 500})
    }
}

const getAnswers = async (reviewerId: string) => {
    const answers = await prisma.answers.findMany(
        {
            where:{
                reviewerId: reviewerId
            }
        })
    return answers
}
