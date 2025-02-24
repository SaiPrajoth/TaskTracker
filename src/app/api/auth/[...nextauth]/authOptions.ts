import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { signInSchema } from "@/schema/signInSchema";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
export const authOptions:NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: {
          label: "Username | Email",
          type: "text",
          placeholder: "jsmith | jsmith@gmail.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req): Promise<any> {
        await dbConnect();

        if (!credentials) {
          throw new Error("credentials not found");
        }

        const validation = signInSchema.safeParse(credentials);

        if (!validation.success) {
          throw new Error("please provide valid inputs for sign in process");
        }

        const user = await UserModel.findOne({
          $or: [
            { username: credentials.identifier },
            {
              email: credentials.identifier,
            },
          ],
        });

        if (!user) {
          throw new Error("user not found");
        }

        if (!user.isVerified) {
          throw new Error("user is not verified, please verify the user");
        }

        const passwordCheck = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordCheck) {
          throw new Error("incorrect password");
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.username = user.username;
        token.premiumTaken = user.premiumTaken;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.username = token.username;
        session.user.premiumTaken = token.premiumTaken;
        session.user.isVerified = token.isVerified;
      }
      return session;
    },
  },
};
