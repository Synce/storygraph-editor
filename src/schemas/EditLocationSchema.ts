import * as z from 'zod';

const editAttributesSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('boolean'),
    key: z.string().min(1),
    value: z.union([z.string(), z.boolean()]).transform(val => Boolean(val)),
  }),
  z.object({
    type: z.literal('string'),
    key: z.string().min(1),
    value: z.string(),
  }),
  z.object({
    type: z.literal('number'),
    key: z.string().min(1),
    value: z.number(),
  }),
]);

export const editLocationSchema = z.object({
  Id: z.string(),
  Type: z.enum(['character', 'location', 'item']),
  Name: z.string().optional().nullable(),
  Comment: z.string().optional().nullable(),
  GivenId: z.string().optional().nullable(),
  Attributes: z
    .array(editAttributesSchema)
    .refine(
      data => {
        const keys = new Set<string>();
        for (const item of data) {
          if (keys.has(item.key)) {
            return false;
          }
          keys.add(item.key);
        }
        return true;
      },
      {
        message: 'Attributes must have unique keys',
      },
    )
    .optional(),
});

export type EditLocationSchema = z.infer<typeof editLocationSchema>;
export type EditAttributesSchema = z.infer<typeof editAttributesSchema>;
