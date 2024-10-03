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

// GET /api/answers?revieweeId=xx
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams
        const revieweeId = searchParams.get("revieweeId") || ""

        let surveys = await getServerByRevieweeId(revieweeId)

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

const getServerByRevieweeId = async (revieweeId: string) => {
    const data = await prisma.answerList.findMany({
        where: {
            revieweeId: revieweeId,
            isCompleted: true
        }
    })
    return data
}

// GET /api/answers?revieweeId=xx
export async function POST  (req: NextRequest) {
    console.log("DONE")
    try {
        await prisma.answerList.update({
            where: { id: '66f4cfe08c8240f72f02915b' }, // Use the correct ID or condition to target the document
            data: {
                createdAt: new Date('2024-10-30T00:00:00Z'), // Set the createdAt field if it doesn't exist
            },
        });

        return new Response("Done", { status: 200 });
    } catch (error) {
        console.error('Error updating document:', error);
        return new Response("Failed to update", { status: 500 });
    }
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
