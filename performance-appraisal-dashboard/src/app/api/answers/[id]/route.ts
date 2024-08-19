import { PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()


// GET /api/answers/[id]
// Gets ALL answers for specific questionId
export async function GET(req: Request,
    { params }: { params: { id: string }}) {
    try {
        const questions = await getAllAnswers(params.id)
        
        return new Response(JSON.stringify(questions), 
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

const getAllAnswers = async (questionId: string) => {
    const questions = await prisma.answers.findMany(
        {
            where:{
                questionId: questionId
            }
        })
    return questions
}
