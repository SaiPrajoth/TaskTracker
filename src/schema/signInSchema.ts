import { z } from "zod";

import { usernameSchema } from "./signUpSchema";

export const signInSchema = z.object({
  identifier: usernameSchema || z.string().email(),

  password: z.string(),
});
