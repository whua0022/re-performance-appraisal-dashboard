import { PrismaClient, QuestionCategory} from '@prisma/client'

const prisma = new PrismaClient()

type QuestionDetails = {
    question: string,
    category: QuestionCategory
}

// GET /api/questions
// Gets ALL questions
export async function GET(req: Request) {
    try {
        const questions = await getAllQuestions()
        
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

// POST /api/questions
// Adds 1 question
export async function POST(req: Request) {  
    try {
        const body = await req.json()

        const questionDetails: QuestionDetails = {
            question: body.question,
            category: body.category
        }

        await postNewQuestion(questionDetails)

        return new Response("Added new question", {status: 200})
    } catch (err) {
        console.error('Error: ', err)
        return new Response("Error", {status: 500})
    }
}

const getAllQuestions = async () => {
    const questions = await prisma.questions.findMany()
    return questions
}

const postNewQuestion = async (questionDetails: QuestionDetails) => {
    await prisma.questions.create({
        data: {
            question: questionDetails.question,
            category: questionDetails.category,
        },
    })
}