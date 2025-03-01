import { z } from "zod";

export const TaskSchema = z.object({
    createdAt:z.date(),
    title:z.string(),
    description:z.string().optional(),
    deadline:z.date().optional(),

})


