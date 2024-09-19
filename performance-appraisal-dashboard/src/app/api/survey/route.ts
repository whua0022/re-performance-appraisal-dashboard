import { PrismaClient} from '@prisma/client'
import { NextRequest } from 'next/server'

const prisma = new PrismaClient()

// POST /api/survey
// Creates a survey
export async function POST(req: Request) {  
    try {
        const body = await req.json()

        const surveyDetails = {
            creatorId: body.creatorId,
            name: body.name,
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

// GET /api/survey?creatorId=...
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams
        const creatorId = searchParams.get("creatorId") || ""
        const surveyId = searchParams.get("surveyId") || ""

        let surveys;

        if (surveyId != "") {
            surveys = await getSurveysBySurveyId(surveyId)
        } else if (creatorId != "") {
            surveys = await getSurveysByCreatorId(creatorId)
        }

        return new Response(JSON.stringify(surveys), 
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



const postNewSurvey = async (surveyDetails:any) => {
    await prisma.surveys.create({
        data: {
            name: surveyDetails.name,
            creatorId: surveyDetails.creatorId,
            devQuestionList: surveyDetails.devQuestionList,
            reQuestionList: surveyDetails.reQuestionList,
            managerQuestionList: surveyDetails.managerQuestionList
        },
    })
}

const getSurveysByCreatorId = async (creatorId:string) => {
    const data = await prisma.surveys.findMany({
        where: {
            creatorId: creatorId
        },
    })

    return data
}

const getSurveysBySurveyId = async (surveyId:string) => {
    const data = await prisma.surveys.findFirst({
        where: {
            id: surveyId
        },
    })

    return data
}