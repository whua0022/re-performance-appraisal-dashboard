import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

type AnswerDetails = {
    surveyId: string;
    reviewerId: string;
    revieweeId: string;
    answers: object[]; 
};

// POST /api/answers
export async function POST(req: Request) {
    try {
        const body = await req.json();
    
        if (!body.reviewerId || !body.revieweeId || !body.surveyId || !body.answers) {
            return new Response("Missing required fields", { status: 400 });
        }

        const answerDetails: AnswerDetails = {
            reviewerId: body.reviewerId,
            revieweeId: body.revieweeId,
            surveyId: body.surveyId,
            answers: body.answers 
        };

        const newAnswer = await postAnswers(answerDetails);
        
        return new Response(JSON.stringify(newAnswer), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error('Error:', err);
        return new Response("Error", { status: 500 });
    }
}

// GET /api/answers?revieweeId=xx or reviewer
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams
        const revieweeId = searchParams.get("revieweeId") || ""
        const reviewerId = searchParams.get("reviewerId") || ""
        const surveyId = searchParams.get("surveyId") || ""
        const isComplete = searchParams.get("isComplete") || ""
        let surveys;

        if (reviewerId != "") {
            if (isComplete === "false") {
                surveys = await getSurveyByReviewerIdIncomplete(reviewerId)
            } else {
                surveys = await getSurveyByReviewerId(reviewerId)
            }     
        } else if (revieweeId != "") {
            surveys = await getSurveyByRevieweeId(revieweeId)
        } else if (surveyId != "") {
            if (isComplete === "false") {
                surveys = await getSurveyBySurveyIdIncomplete(surveyId)
            } else {
                surveys = await getSurveyBySurveyId(surveyId)
            }
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

// PUT /api/answers
export async function PUT(req: NextRequest) {
  try {
    const { answerListId, answers } = await req.json();

    if (!answerListId || !answers || !Array.isArray(answers)) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Updating the answers for the given answerListId
    const updatedAnswerList = await prisma.answerList.update({
      where: {
        id: answerListId,
      },
      data: {
        answers: {
          set: answers, 
        },
        isCompleted: {
            set: true
        }
      },
    });

    return new Response(JSON.stringify(updatedAnswerList), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating answers: ', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


const getSurveyByReviewerId = async (reviewerId: string) => {
    const data = await prisma.answerList.findMany({
        where: {
            reviewerId: reviewerId,
            isCompleted: true
        }
    })
    return data
}

const getSurveyByReviewerIdIncomplete = async (reviewerId: string) => {
    const data = await prisma.answerList.findMany({
        where: {
            reviewerId: reviewerId,
            isCompleted: false
        }
    })
    return data
}

const getSurveyByRevieweeId = async (revieweeId: string) => {
    const data = await prisma.answerList.findMany({
        where: {
            revieweeId: revieweeId,
            isCompleted: true
        }
    })
    return data
}

const getSurveyBySurveyId = async (surveyId: string) => {
    const data = await prisma.answerList.findMany({
        where: {
            surveyId: surveyId,
            isCompleted: true
        }
    })
    return data
}

const getSurveyBySurveyIdIncomplete = async (surveyId: string) => {
    const data = await prisma.answerList.findMany({
        where: {
            surveyId: surveyId,
            isCompleted: false
        }
    })
    return data
}

const postAnswers = async (answerDetails: AnswerDetails) => {
    return await prisma.answerList.create({
        data: {
            reviewerId: answerDetails.reviewerId,
            revieweeId: answerDetails.revieweeId,
            surveyId: answerDetails.surveyId,
            answers: answerDetails.answers
        }
    });
}
