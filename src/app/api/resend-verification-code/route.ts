import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { sendVerificationEmail } from "@/helper/sendVerificationEmail";
import { verifyCodeSchema } from "@/schema/verifyCodeSchema";
import {z} from 'zod';
import { usernameSchema as UsernameSchema } from "@/schema/signUpSchema";

const usernameQuery = z.object({
  username: UsernameSchema,
});

async function resendVerifyCode(request: Request) {
  await dbConnect();
  try {
    const verifyCode = Math.floor(100000 + Math.random() * 99999).toString();
    const verifyCodeExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const { searchParams } = new URL(request.url);

    

    const validation = verifyCodeSchema.safeParse({
      otp: verifyCode,
    });
    


    const validationUsername = usernameQuery.safeParse({
      username: searchParams.get("username"),
    });

    if (!validation.success || !validationUsername.success) {
      return Response.json(
        {
          success: false,
          message:
            "(input validation failed) please provide correct credentials for re-sending verification code",
        },
        { status: 400 }
      );
    }

    const username = validationUsername.data.username;

    const user = await UserModel.findOne({ username });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "(user not found) re-sending verification code failed",
        },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return Response.json(
        {
          success: false,
          message:
            "(redudant task) user already verified, re-sending verification code cancelled",
        },
        { status: 403 }
      );
    }

    const email = user.email;

    const response = await sendVerificationEmail(email, username, verifyCode);

    if (response.success) {
      user.verifyCodeExpiry = verifyCodeExpiry;
      user.verifyCode = verifyCode;
      await user.save();
    }

    return Response.json(
      {
        success: response.success,
        message: response.message,
      },
      { status: response.success ? 200 : 500 }
    );
  } catch (error) {
    console.error(
      "error occured while resending the verification code ",
      error
    );
    return Response.json(
      {
        success: false,
        message: "error occured while resending the verification code",
      },
      { status: 500 }
    );
  }
}
export { resendVerifyCode as POST };
