

import UserModel from '@/models/user.model';
import { getServerSession } from 'next-auth/next';
import { dbConnect } from '@/lib/dbConnect';
import mongoose from 'mongoose';
import { authOptions } from '../../auth/[...nextauth]/authOptions';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ taskId: string }> } // Note the Promise type
) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const _user = session?.user;

  if (!session || !_user) {
    return new Response(
      JSON.stringify({ success: false, message: 'Not authenticated' }),
      { status: 401 }
    );
  }

  try {
    const { taskId } = await context.params; // Awaiting params
    const taskObjectId = new mongoose.Types.ObjectId(taskId);
    const userId = new mongoose.Types.ObjectId(_user._id);

    // Debugging logs
    const userFound = await UserModel.findById(userId);
    console.log("User Found:", userFound);
    console.log("Task IDs in DB:", userFound?.tasks.map(m => m.id.toString()));
    console.log("Deleting task ID:", taskId);

    // Perform deletion
    const updateResult = await UserModel.updateOne(
      { _id: userId },
      { $pull: { messages: { _id: taskObjectId } } }
    );

    console.log("MongoDB Update Result:", updateResult);

    if (updateResult.modifiedCount === 0) {
      return new Response(
        JSON.stringify({ message: 'Task not found or already deleted', success: false }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Task deleted', success: true }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting task:', error);
    return new Response(
      JSON.stringify({ message: 'Error deleting task', success: false }),
      { status: 500 }
    );
  }
}
