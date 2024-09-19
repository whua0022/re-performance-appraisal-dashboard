import { PrismaClient, Users} from '@prisma/client'
import { NextRequest } from 'next/server'

const prisma = new PrismaClient()

// GET /api/teams
// Returns an array of team names
export async function GET(req: NextRequest) {
    try {
        const teams = await getTeams()

        return new Response(JSON.stringify(teams), 
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

const getTeams = async () => {
    const data = await prisma.teams.findMany()
    return data
}
