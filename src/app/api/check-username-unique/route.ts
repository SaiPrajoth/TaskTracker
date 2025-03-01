import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { usernameSchema as UsernameSchema } from "@/schema/signUpSchema";
import { z } from "zod";
const query = z.object({
  username: UsernameSchema,
});

async function extractAndGenerateUniqueUsername(username: string) {
  // Validate and transform the input username
  const parsedUsername = UsernameSchema.parse(username);

  // Extract root username by removing all digits and underscores (preserving the order)
  const rootUsername = parsedUsername.replace(/[0-9_]/g, "");

  if (!rootUsername) {
    throw new Error(
      "Invalid username format. Root username cannot be extracted."
    );
  }

  // Ensure root username has at least 2 characters
  if (rootUsername.length < 2) {
    throw new Error("Root username must be at least 2 characters.");
  }

  while (true) {
    const randomNum = Math.floor(Math.random() * 100000);

    // Randomly choose one of the two formats
    let suggestion =
      Math.random() > 0.5
        ? `${rootUsername}_${randomNum}`
        : `${rootUsername}${randomNum}`;

    // Enforce max length of 20 characters
    if (suggestion.length > 20) {
      suggestion = suggestion.slice(0, 20);
    }

    // Validate final suggestion with UsernameSchema
    suggestion = UsernameSchema.parse(suggestion);

    const userExists = await UserModel.findOne({ username: suggestion });
    if (!userExists) return suggestion;
  }
}

const checkUsernameUnique = async (request: Request) => {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);

    const validation = query.safeParse({
      username: searchParams.get("username"),
    });
    if (!validation.success) {
      const errors = validation.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            errors.length > 0 ? errors.join(",") : "invalid query params",
        },
        { status: 400 }
      );
    }

    const { username } = validation.data;

    const user = await UserModel.findOne({ username, isVerified: true });

    if (user) {
      const recommendations = await extractAndGenerateUniqueUsername(username);
      return Response.json(
        {
          success: false,
          message: `username is already taken, recommendations:${recommendations}`,
        },
        { status: 409 }
      );
    }

    return Response.json(
      {
        success: false,
        message: `${username} : username is available`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "error occured while checking the username availability ",
      error
    );
    return Response.json(
      {
        success: false,
        message: "error occured while checking the username availability",
      },
      { status: 500 }
    );
  }
};


export {checkUsernameUnique as GET}