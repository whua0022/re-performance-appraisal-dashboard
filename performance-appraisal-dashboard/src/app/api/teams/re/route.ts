import { PrismaClient, Users} from '@prisma/client'
import { NextRequest } from 'next/server'

const prisma = new PrismaClient()

// GET /api/teams/re
export async function GET(req: NextRequest) {
    try {
        const res = await getRes()

        return new Response(JSON.stringify(res), 
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

const getRes = async () => {
    const data = await prisma.users.findMany({
        where: {
            roles: "RE"
        }
    })
    return data
}