import { z } from "zod";

export const createOrgSchema = z.object({
  name: z.string().min(3, "O nome deve ter no mínimo 3 caracteres."),
  slug: z
    .string()
    .min(3, "O slug deve ter no mínimo 3 caracteres.")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens."),
  document: z.string().optional(),
});

export type CreateOrgData = z.infer<typeof createOrgSchema>;