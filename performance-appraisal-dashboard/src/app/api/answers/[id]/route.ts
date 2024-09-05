import { PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()


// GET /api/answers/[id]
// Gets answer
export async function GET(req: Request,
    { params }: { params: { id: string }}) {
    try {
        const answers = await getAllAnswers(params.id)
        
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

const getAllAnswers = async (answerId: string) => {
    const answers = await prisma.answers.findMany(
        {
            where:{
                id: answerId
            }
        })
    return answers
}
