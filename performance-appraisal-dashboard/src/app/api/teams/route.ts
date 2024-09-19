import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type TeamDetails = {
    name: string;
};

// GET /api/teams
// Retrieves all teams
export async function GET(req: Request) {
    try {
        const teams = await prisma.teams.findMany();
        return new Response(JSON.stringify(teams), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error('Error: ', err);
        return new Response("Error", { status: 500 });
    }
}

// POST /api/teams
// Creates a new team
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const teamDetails: TeamDetails = {
            name: body.name
        };

        await prisma.teams.create({
            data: teamDetails
        });

        return new Response("Added new team", { status: 200 });
    } catch (err) {
        console.error('Error: ', err);
        return new Response("Error", { status: 500 });
    }
}
