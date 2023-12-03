import {z} from 'zod';

const dictionarySchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean()]),
);

const narrationSchema = z.object({
  Name: z.string().optional(),
  Id: z.string().optional(),
  Attributes: dictionarySchema.optional(),
});

export type NarrationSchema = z.infer<typeof narrationSchema>;

export type ItemSchema = {
  Name?: string;
  Id?: string;
  Attributes?: Record<string, string | number | boolean>;
  Items?: ItemSchema[];
  Narration?: NarrationSchema[];
};

const itemSchema: z.ZodType<ItemSchema> = z.lazy(() =>
  z.object({
    Name: z.string().optional(),
    Id: z.string().optional(),
    Attributes: dictionarySchema.optional(),
    Items: z.array(itemSchema).optional(),
    Narration: z.array(narrationSchema).optional(),
  }),
);

const characterSchema = z.object({
  Name: z.string().optional(),
  Id: z.string().optional(),
  Comment: z.string().optional(),
  IsObject: z.string().optional(),
  Items: z.array(itemSchema).optional(),
  Narration: z.array(narrationSchema).optional(),
  Attributes: dictionarySchema.optional(),
});

const connectionSchema = z.object({
  Destination: z.string(),
  Attributes: dictionarySchema.optional(),
});

const locationSchema = z.object({
  Name: z.string().optional(),
  Id: z.string().optional(),
  Comment: z.string().optional(),
  IsObject: z.boolean().optional(),
  Characters: z.array(characterSchema).optional(),
  Items: z.array(itemSchema).optional(),
  Narration: z.array(narrationSchema).optional(),
  Connections: z.array(connectionSchema).optional(),
  Attributes: dictionarySchema.optional(),
});

export const worldSchema = z.object({
  Title: z.string(),
  TitleGeneric: z.string(),
  Description: z.string(),
  Override: z.number().int(),
  Comment: z.string().optional(),
  LSide: z.object({
    Locations: z.array(locationSchema),
  }),
  RSide: z.object({}),
  Preconditions: z.object({}).optional(),
  Instructions: z.array(z.object({})),
});

export type CharacterSchema = z.infer<typeof characterSchema>;
export type ConnectionSchema = z.infer<typeof characterSchema>;

export type WorldSchema = z.infer<typeof worldSchema>;
