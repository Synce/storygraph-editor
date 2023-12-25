import * as zod from 'zod';

export const editLocationSchema = zod.object({
  Id: zod.string(),
  Name: zod.string().optional().nullable(),
  Comment: zod.string().optional().nullable(),
  GivenId: zod.string().optional().nullable(),
});

export type EditLocationSchema = zod.infer<typeof editLocationSchema>;
