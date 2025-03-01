import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import mongoose from "mongoose";
import { User } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/authOptions";

async function getTasks(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const _user: User = session?.user as User;

  console.log(_user);

  if (!session || !_user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }
  const userId = new mongoose.Types.ObjectId(_user._id);

  const userExists = await UserModel.findById(userId);

  console.log("user id", userId);

  if (!userExists) {
    return Response.json(
      { message: "User not found", success: false },
      { status: 404 }
    );
  }

  try {
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$tasks" },
      { $sort: { "tasks.createdAt": -1 } },
      { $group: { _id: "$_id", tasks: { $push: "$tasks" } } },
    ]).exec();

 

    return Response.json(
      { tasks: user[0]?.tasks || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}

export { getTasks as GET };
