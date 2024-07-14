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

const nodeType = z.enum(['character', 'location', 'item', 'narration']);

export type NodeType = z.infer<typeof nodeType>;

export const editNodeSchema = z.object({
  Id: z.string(),
  Type: nodeType,
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

export type EditNodeSchema = z.infer<typeof editNodeSchema>;
export type EditAttributesSchema = z.infer<typeof editAttributesSchema>;

const addLocationSchema = z.object({
  Type: z.literal(nodeType.enum.location),
  worldId: z.string(),
});

const addItemSchema = z.intersection(
  z.object({
    Type: z.literal(nodeType.enum.item),
  }),
  z.union([
    z.object({
      locationId: z.string(),
    }),
    z.object({
      parentItemId: z.string(),
    }),
    z.object({
      characterId: z.string(),
    }),
  ]),
);

const addNarrationSchema = z.intersection(
  z.object({
    Type: z.literal(nodeType.enum.narration),
  }),
  z.union([
    z.object({
      locationId: z.string(),
    }),
    z.object({
      itemId: z.string(),
    }),
    z.object({
      characterId: z.string(),
    }),
    z.object({
      ItemId: z.string(),
    }),
  ]),
);

const addCharacterSchema = z.object({
  Type: z.literal(nodeType.enum.character),
  locationId: z.string(),
});

export const addNodeSchema = z.union([
  addLocationSchema,
  addItemSchema,
  addCharacterSchema,
  addNarrationSchema,
]);

export type AddNodeSchema = z.infer<typeof addNodeSchema>;
