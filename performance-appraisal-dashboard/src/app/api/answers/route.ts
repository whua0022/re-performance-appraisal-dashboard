import { PrismaClient } from '@prisma/client';

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
