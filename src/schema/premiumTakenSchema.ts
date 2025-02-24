import { z } from "zod";

export const premiumTakenSchema = z.object({
  premiumTaken: z.boolean(),
});
