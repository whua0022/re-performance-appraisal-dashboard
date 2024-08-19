import { PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

type AnswerDetails = {
    questionId: string,
    reviewerId: string,
    revieweeId: string,
    answer: string
}

// POST /api/answers
// Adds 1 answers
export async function POST(req: Request) {
    try {
        const body = await req.json()
 
        const answerDetails: AnswerDetails = {
            reviewerId: body.reviewerId,
            revieweeId: body.revieweeId,
            questionId: body.questionId,
            answer: body.answer
        }

        const answers = await postAnswers(answerDetails)
        
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

const postAnswers = async (answerDetails: AnswerDetails) => {
    await prisma.answers.create({
        data: {
            reviewerId: answerDetails.reviewerId,
            revieweeId: answerDetails.revieweeId,
            questionId: answerDetails.questionId,
            answer: answerDetails.answer
        },
    })
}
