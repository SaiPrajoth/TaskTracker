import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { usernameSchema as UsernameSchema } from "@/schema/signUpSchema";
import { verifyCodeSchema } from "@/schema/verifyCodeSchema";

import { z } from "zod";
const usernameQuery = z.object({
  username: UsernameSchema,
});
export const verifyCode = async (request: Request) => {
  await dbConnect();

  try {
    const body = await request.json();
    const validation = verifyCodeSchema.safeParse({ otp: body.otp });
    const validationUsername = usernameQuery.safeParse({
      username: body.username,
    });

    if (!validation.success || !validationUsername.success) {
      return Response.json(
        {
          success: false,
          message:
            "(user verification failed) please provide valid credentials for verification process",
        },
        { status: 500 }
      );
    }

    const { username } = validationUsername.data;
    const { otp } = validation.data;

    const user = await UserModel.findOne({ username });
    if (!user) {
      return Response.json(
        {
          success: false,
          message:
            "(user verification failed) please provide valid credentials for verification process",
        },
        { status: 500 }
      );
    }

    if (user.isVerified) {
      return Response.json(
        {
          success: false,
          message: "(redudant task) user already verified",
        },
        { status: 403 }
      );
    }

    if (Date.now() > user.verifyCodeExpiry.getTime()) {
      return Response.json(
        {
          success: false,
          message: "(verification process failed) verification code expired",
        },
        { status: 400 }
      );
    }

    const OTPcheck = otp === user.verifyCode;

    if (!OTPcheck) {
      return Response.json(
        {
          success: false,
          message: "(verification process failed) incorrect verification code",
        },
        { status: 400 }
      );
    }

    user.isVerified = true;
    await user.save();

    return Response.json(
      {
        success: true,
        message: "user verified successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("error occured while verifying the user ", error);
    return Response.json(
      {
        success: false,
        message: "error occured while verifying the user",
      },
      { status: 500 }
    );
  }
};

export {verifyCode as POST}
