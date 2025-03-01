import { dbConnect } from "@/lib/dbConnect";
import UserModel, { Task } from "@/models/user.model";
import { TaskSchema } from "@/schema/taskSchema";
import { getServerSession } from "next-auth";

async function sendTasks(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    const session = await getServerSession();
    const user = session?.user;

    if (!session || !user) {
      return Response.json(
        {
          success: false,
          message: "user not authenticated",
        },
        { status: 403 }
      );
    }

    const TaskQuery = {
      createdAt: body.createdAt,
      title: body.title,
      ...(body.description && { description: body.description }),
      ...(body.deadline && { deadline: body.deadline }),
    };

    const validation = TaskSchema.safeParse(TaskQuery);

    if (!validation.success) {
      return Response.json(
        {
          success: false,
          message:
            "(input validation failed) please provide correct fields for sending messages",
        },
        { status: 400 }
      );
    }

    const { title, description, createdAt, deadline } = validation.data;

    const userFound = await UserModel.findById(user._id);

    if (!userFound) {
      return Response.json(
        {
          success: false,
          message: "(user not found) failed to add the tasks",
        },
        { status: 404 }
      );
    }

    const task = { createdAt, title, description, deadline };

    userFound.tasks.push(task as Task);

    await userFound.save();

    return Response.json(
      {
        success: true,
        message: "(task added successfully) task successfull",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("error occured while adding the task ", error);
    return Response.json(
      {
        success: true,
        message: "error occured while adding the task",
      },
      { status: 500 }
    );
  }
}

export { sendTasks as POST };
