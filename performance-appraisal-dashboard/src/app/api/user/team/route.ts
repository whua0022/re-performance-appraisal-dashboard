import { PrismaClient, Users} from '@prisma/client'
import { NextRequest } from 'next/server'

const prisma = new PrismaClient()

// GET /user/team?userId=
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams
        const userId = searchParams.get("userId") || ""

        const teams = await getTeamsForMember(userId)

        return new Response(JSON.stringify(teams), 
            {
                status: 200,
                headers: {'Content-Type': 'application/json'}
            }
        )
    } catch(err) {
        console.error('Error: ', err)
        return new Response("Error", {status: 500})
    }

}

const getTeamsForMember = async (memberId: string) => {
    const teams = await prisma.teams.findMany({
        where: {
            members: {
                has: memberId 
            }
        }
    });
    return teams;
}