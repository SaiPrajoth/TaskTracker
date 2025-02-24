import { z } from "zod";

export const verifyCodeSchema = z.object({
    otp:z.string().length(6,'verification code should have 6 characters')
});
