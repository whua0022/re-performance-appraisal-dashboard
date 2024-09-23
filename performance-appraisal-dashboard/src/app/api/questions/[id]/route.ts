import { PrismaClient } from '@prisma/client';
import { spec } from 'node:test/reporters';

const prisma = new PrismaClient();

type QuestionDetails = {
    question: string;
    category: string;
};

// GET /api/questions/:id
// Retrieves a specific question by ID
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const id = url.pathname.split('/').pop() as string;
        
        const question = await getQuestionById(id);

        if (!question) {
            return new Response("Question not found", { status: 404 });
        }

        return new Response(JSON.stringify(question), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error('Error: ', err);
        return new Response("Error", { status: 500 });
    }
}

// PUT /api/questions/:id
// Updates a specific question by ID
export async function PUT(req: Request) {
    try {
        const url = new URL(req.url);
        const id = url.pathname.split('/').pop() as string; 

        const body = await req.json();

        const updatedQuestion: QuestionDetails = {
            question: body.question,
            category: body.category
        };

        await updateQuestion(id, updatedQuestion);

        return new Response("Updated question", { status: 200 });
    } catch (err) {
        console.error('Error: ', err);
        return new Response("Error", { status: 500 });
    }
}

// DELETE /api/questions/:id
// Deletes a specific question by ID
export async function DELETE(req: Request) {
    try {
        const url = new URL(req.url);
        const id = url.pathname.split('/').pop() as string; 

        await deleteQuestion(id);

        return new Response("Deleted question", { status: 200 });
    } catch (err) {
        console.error('Error: ', err);
        return new Response("Error", { status: 500 });
    }
}

const getQuestionById = async (id: string) => {
    return await prisma.questions.findUnique({
        where: { id: id } 
    });
};

const updateQuestion = async (id: string, questionDetails: QuestionDetails) => {
    await prisma.questions.update({
        where: { id: id }, 
        data: {
            question: questionDetails.question,
            category: questionDetails.category,
        },
    });
};

const deleteQuestion = async (id: string) => {
    await prisma.questions.delete({
        where: { id: id },  
    });
};
