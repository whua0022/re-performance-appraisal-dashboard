import { PrismaClient, QuestionCategory} from '@prisma/client'

const prisma = new PrismaClient()

type SurveyDetails = {
    creatorId: string,
    devQuestionList: JSON[],
    reQuestionList: JSON[],
    managerQuestionList: JSON[]
}

// POST /api/survey/create
// Creates a survey
export async function POST(req: Request) {  
    try {
        const body = await req.json()

        const surveyDetails: SurveyDetails = {
            creatorId: body.creatorId,
            devQuestionList: body.devQuestionList,
            reQuestionList: body.reQuestionList,
            managerQuestionList: body.managerQuestionList
        }

        await postNewSurvey(surveyDetails)

        return new Response("Added new survey", {status: 200})
    } catch (err) {
        console.error('Error: ', err)
        return new Response("Error", {status: 500})
    }
}

const postNewSurvey = async (surveyDetails: SurveyDetails) => {
    await prisma.surveys.create({
        data: {
            creatorId: surveyDetails.creatorId,
            devQuestionList: surveyDetails.devQuestionList,
            reQuestionList: surveyDetails.reQuestionList,
            managerQuestionList: surveyDetails.managerQuestionList
        },
    })
}