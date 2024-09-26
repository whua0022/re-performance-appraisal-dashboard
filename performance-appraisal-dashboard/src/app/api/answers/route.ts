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