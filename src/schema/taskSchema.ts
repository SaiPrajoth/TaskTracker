import { z } from "zod";

export const TaskSchema = z.object({
    title:z.string(),
    description:z.string().optional(),
    deadline:z.date().optional()
})


