import { PrismaClient, Users} from '@prisma/client'
import { NextRequest } from 'next/server'

const prisma = new PrismaClient()

// GET /api/teams
// Returns an array of {id, name}
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams
        const teamId = searchParams.get("teamId") || ""

        const memberIds = await getMemberIds(teamId)
        let memberDetails: any[]= []

        memberIds?.members.forEach(async id => {
            let detail = await getUserDetails(id)
            memberDetails.push(detail)
        });


        return new Response(JSON.stringify(memberDetails), 
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

const getMemberIds = async (teamId:string) => {
    const data = await prisma.teams.findFirst({
        where: {
            id: teamId
        },
    })

    return data
}

const getUserDetails = async (memberId: string) => {
    const data = await prisma.users.findFirst({
        where: {
            id: memberId
        },
    })

    return data
}