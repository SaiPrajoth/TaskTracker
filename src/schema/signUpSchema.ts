import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(2, "username should be atleast of 2 characters")
  .max(20, "username should be atmost of 20 characters")
  .regex(/^[a-zA-Z0-9 _]+$/, "username should not contain special characters")
  .transform((username) => {
    return username.toLowerCase().replace(/\s+g/, '');
  });

export const signUpSchema = z.object({
    username:usernameSchema,
    email:z.string().email(),
    password:z.string()
})


