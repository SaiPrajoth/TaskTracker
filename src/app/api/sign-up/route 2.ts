import { sendVerificationEmail } from "@/helper/sendVerificationEmail";
import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { signUpSchema } from "@/schema/signUpSchema";
import bcrypt from "bcryptjs";

const signUp = async (request: Request) => {
  await dbConnect();
  try {
    const body = await request.json();

    const validation = signUpSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        {
          success: false,
          message:
            "status : please provide valid inputs for the user registration",
        },
        { status: 400 }
      );
    }

    const { firstname, lastname, username, email, password } = body;

    const UserExistsByUsername = await UserModel.findOne({ username });

    if (UserExistsByUsername) {
      if (UserExistsByUsername.isVerified) {
        return Response.json(
          {
            success: false,
            message: "status : username already taken",
          },
          { status: 409 }
        );
      }

      const newUsername = "abc";

      UserExistsByUsername.username = newUsername;
      await UserExistsByUsername.save();
    }

    const UserExistsByEmail = await UserModel.findOne({ email });
    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyCode = Math.floor(Math.random() * 99999 + 100000).toString();
    const verifyCodeExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000);

    if (UserExistsByEmail) {
      if (UserExistsByEmail.isVerified) {
        const passwordCheck = await bcrypt.compare(
          password,
          UserExistsByEmail.password
        );
        return Response.json(
          {
            success: false,
            message: passwordCheck
              ? "status : user already registered"
              : "status : user already registered, please try login. kindly use right password as we see a mismatch with the password",
          },
          { status: 403 }
        );
      }

      UserExistsByEmail.firstname = firstname;
      if (lastname) UserExistsByEmail.lastname = lastname;

      UserExistsByEmail.username = username;
      UserExistsByEmail.password = hashedPassword;
      UserExistsByEmail.verifyCode = verifyCode;
      UserExistsByEmail.verifyCodeExpiry = verifyCodeExpiry;
      await UserExistsByEmail.save();
    } else {
      await UserModel.create({
        firstname,
        ...(lastname && { lastname }),
        username,
        email,
        password: hashedPassword,
        isVerified: false,
        premiumTaken: false,
        verifyCode,
        verifyCodeExpiry,
        tasks: [],
      });
    }

    const response = await sendVerificationEmail(email, username, verifyCode);

    return Response.json(
      {
        success: response.success,
        message: response.message,
      },
      { status: response.success ? 200 : 500 }
    );
  } catch (error) {
    console.error("error occured while registering the user ", error);

    return Response.json(
      {
        success: false,
        message: "error occured while registering the user",
      },
      { status: 500 }
    );
  }
};


export {signUp as POST}