import { PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()


 // GET /api/users/[id]
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getUser(params.id);
        
        if (!user) {
            return new Response("User not found", { status: 404 });
        }

        return new Response(JSON.stringify(user), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error('Error fetching user:', err);
        return new Response("Error fetching user", { status: 500 });
    }
}

const getUser = async (userId: string) => {
    try {
        const user = await prisma.users.findUnique({
            where: { id: userId }
        });
        return user;
    } catch (err) {
        console.error('Error fetching user from database:', err);
        throw new Error('Database error');
    }
};


// PUT /api/users/[id]
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const updatedData = await req.json();

        if (!updatedData || !Array.isArray(updatedData.teams)) {
            console.error("Invalid data: teams should be an array");
            return new Response("Invalid data", { status: 400 });
        }

        const updatedUser = await updateUser(params.id, updatedData);
        return new Response(JSON.stringify(updatedUser), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error('Error updating user:', err);
        return new Response("Error updating user", { status: 500 });
    }
}

const updateUser = async (userId: string, updatedData: any) => {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { teams: true },
      });
  
      if (!user) {
        throw new Error('User not found');
      }
      const updatedTeams: string[] = Array.isArray(updatedData.teams) ? updatedData.teams : [];
 
      return await prisma.users.update({
        where: { id: userId },
        data: {
          teams: updatedTeams,
        },
      });
    } catch (err) {
      console.error('Error updating user in database:', err);
      throw err; 
    }
  }
  
  
