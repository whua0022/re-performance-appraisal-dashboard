import { PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
    return new Response("Response")
}

const getAllUserStoryRatings = async () => {
    const userStoryRatings = await prisma.userStoryRating.findMany()
    console.log(userStoryRatings)
}
