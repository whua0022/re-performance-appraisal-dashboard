import { PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/survey/create
// Creates a survey
export async function POST(req: Request) {  
    try {
        const body = await req.json()

        const surveyDetails = {
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

const postNewSurvey = async (surveyDetails:any) => {
    await prisma.surveys.create({
        data: {
            creatorId: surveyDetails.creatorId,
            devQuestionList: surveyDetails.devQuestionList,
            reQuestionList: surveyDetails.reQuestionList,
            managerQuestionList: surveyDetails.managerQuestionList
        },
    })
}