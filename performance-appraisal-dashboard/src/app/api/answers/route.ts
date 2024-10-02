import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient()

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