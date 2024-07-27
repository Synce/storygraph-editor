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

export const nodeType = z.enum(['Character', 'Location', 'Item', 'Narration']);

export type NodeType = z.infer<typeof nodeType>;

export const editNodeSchema = z.object({
  Id: z.string(),
  Type: nodeType,
  Name: z.string().optional().nullable(),
  Comment: z.string().optional().nullable(),
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

export type EditNodeSchema = z.infer<typeof editNodeSchema>;
export type EditAttributesSchema = z.infer<typeof editAttributesSchema>;

export const addNodeSchema = z.object({
  Type: nodeType,
  parentWorldNodeId: z.number(),
});

export type AddNodeSchema = z.infer<typeof addNodeSchema>;
