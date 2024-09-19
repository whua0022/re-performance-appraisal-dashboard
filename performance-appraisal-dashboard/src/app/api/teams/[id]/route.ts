import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type UpdateTeamDetails = {
    userId?: string;
    name?: string;
    removeUserId?: string;
};

// GET /api/teams/[id]
export async function GET(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        const team = await prisma.teams.findUnique({
            where: { id }
        });

        if (!team) {
            return new Response("Team not found", { status: 404 });
        }

        return new Response(JSON.stringify(team), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error('Error fetching team: ', err);
        return new Response("Error", { status: 500 });
    }
}

// PUT /api/teams/[id]
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        const body = await req.json();
        const updateTeamDetails: UpdateTeamDetails = {
            userId: body.userId,
            name: body.name,
            removeUserId: body.removeUserId
        };

        const team = await prisma.teams.findUnique({
            where: { id }
        });

        if (!team) {
            return new Response("Team not found", { status: 404 });
        }
    
        if (updateTeamDetails.userId) {
            if (team.members.includes(updateTeamDetails.userId)) {
                return new Response("User already a member of the team", { status: 400 });
            }

            const updatedMembers = [...team.members, updateTeamDetails.userId];

            await prisma.teams.update({
                where: { id },
                data: {
                    members: updatedMembers
                }
            });

            return new Response("User added to team", { status: 200 });
        }

        if (updateTeamDetails.removeUserId) {
            const updatedMembers = team.members.filter(member => member !== updateTeamDetails.removeUserId);

            if (updatedMembers.length === team.members.length) {
                return new Response("User not found in team", { status: 400 });
            }

            await prisma.teams.update({
                where: { id },
                data: {
                    members: updatedMembers
                }
            });

            return new Response("User removed from team", { status: 200 });
        }

        if (updateTeamDetails.name) {
            await prisma.teams.update({
                where: { id },
                data: {
                    name: updateTeamDetails.name
                }
            });
            return new Response("Team name updated", { status: 200 });
        }

        return new Response("No valid data to update", { status: 400 });
    } catch (err) {
        console.error('Error updating team: ', err);
        return new Response("Error updating team", { status: 500 });
    }
}

// DELETE /api/teams/[id]
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        await prisma.teams.delete({
            where: { id }
        });

        return new Response("Team deleted", { status: 200 });
    } catch (err) {
        console.error('Error deleting team: ', err);
        return new Response("Error deleting team", { status: 500 });
    }
}
