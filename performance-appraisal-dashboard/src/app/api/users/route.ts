import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/users
export async function GET(req: Request) {
  try {
    const users = await prisma.users.findMany();
    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error fetching users: ', err);
    return new Response("Error fetching users", { status: 500 });
  }
}

// POST /api/users
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, username, roles } = body;

    if (!name || !email || !username || !roles) {
      return new Response("Missing fields", { status: 400 });
    }

    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        username,
        roles,
        teams: [],
      },
    });

    return new Response(JSON.stringify(newUser), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error creating user: ', err);
    return new Response("Error creating user", { status: 500 });
  }
}
