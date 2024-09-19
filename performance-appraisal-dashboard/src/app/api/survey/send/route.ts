import { PrismaClient, Questions} from '@prisma/client'
import { NextRequest } from 'next/server'

const prisma = new PrismaClient()

type AnswerQuestion = {
    category: string,
    question: string,
    answer: any
}
// POST /api/survey/send?role=something
// Creates a survey
export async function POST(req: NextRequest) {  
    try {
        const body = await req.json()
        const searchParams = req.nextUrl.searchParams
        const role = searchParams.get("role")

        const questions = await getQuestionsFromSurvey(body.surveyId)

        let surveyToSend = {
            reviewerId: body.reviewerId,
            revieweeId: body.revieweeId,
            answers: [] as Array<{ category: string; question: string; answer: any }>
        }

        if (role == "USER") {
            (questions?.devQuestionList as AnswerQuestion[])?.forEach((question) => {
                surveyToSend.answers.push({
                  category: question.category,
                  question: question.question,
                  answer: null,
                });
            });
        } else if (role == "RE") {
            (questions?.reQuestionList as AnswerQuestion[])?.forEach((question) => {
                surveyToSend.answers.push({
                  category: question.category,
                  question: question.question,
                  answer: null,
                });
            });
        } else if (role == "MANAGER") {
            (questions?.managerQuestionList as AnswerQuestion[])?.forEach((question) => {
                surveyToSend.answers.push({
                  category: question.category,
                  question: question.question,
                  answer: null,
                });
            });
        } else {
            return new Response("Invalid role", {status: 400})
        }

        await postNewAnswerList(surveyToSend)

        return new Response("Added new survey", {status: 200})
    } catch (err) {
        console.error('Error: ', err)
        return new Response("Error", {status: 500})
    }
}


const getQuestionsFromSurvey = async (surveyId:string) => {
    const data = await prisma.surveys.findFirst({
        where: {
            id: surveyId
        },
    })

    return data
}

const postNewAnswerList = async (surveyToSend:any) => {
    await prisma.answerList.create({
        data: {
            reviewerId: surveyToSend.reviewerId,
            revieweeId: surveyToSend.revieweeId,
            answers: surveyToSend.answers,
            isCompleted: false
        },
    })
}