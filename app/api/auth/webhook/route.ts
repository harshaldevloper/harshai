import { NextResponse } from 'next/server';

/**
 * Clerk Webhook Handler
 * Syncs user data from Clerk to our database
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    console.log('Clerk webhook received:', type);

    switch (type) {
      case 'user.created':
        // Create user in our database
        await createUser(data);
        break;
      case 'user.updated':
        // Update user in our database
        await updateUser(data);
        break;
      case 'user.deleted':
        // Delete user from our database
        await deleteUser(data.id);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook failed' },
      { status: 500 }
    );
  }
}

async function createUser(data: any) {
  // TODO: Implement with Prisma
  console.log('Creating user:', data.id, data.email);
}

async function updateUser(data: any) {
  // TODO: Implement with Prisma
  console.log('Updating user:', data.id);
}

async function deleteUser(userId: string) {
  // TODO: Implement with Prisma
  console.log('Deleting user:', userId);
}
