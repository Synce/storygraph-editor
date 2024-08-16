import {z} from 'zod';

const dictionarySchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean(), z.null()]),
);

export type NodeSchema = {
  Name?: string;
  Id?: string;
  Comment?: string;
  IsObject?: boolean;
  Attributes?: Record<string, string | number | boolean | null>;
  Items?: NodeSchema[];
  Narration?: NodeSchema[];
  Characters?: NodeSchema[];
  Connections?: ConnectionSchema[];
};

const connectionSchema = z.object({
  Destination: z.string(),
  Attributes: dictionarySchema.optional(),
});

const nodeSchema: z.ZodType<NodeSchema> = z.lazy(() =>
  z.object({
    Name: z.string().optional(),
    Id: z.string().optional(),
    Comment: z.string().optional(),
    IsObject: z.boolean().optional(),
    Characters: z.array(nodeSchema).optional(),
    Items: z.array(nodeSchema).optional(),
    Narration: z.array(nodeSchema).optional(),
    Connections: z.array(connectionSchema).optional(),
    Attributes: dictionarySchema.optional(),
  }),
);

export const worldSchema = z.object({
  Title: z.string(),
  TitleGeneric: z.string(),
  Description: z.string(),
  Override: z.number().int(),
  Comment: z.string().optional(),
  LSide: z.object({
    Locations: z.array(nodeSchema),
  }),
  RSide: z.object({}),
  Preconditions: z.array(z.object({})).optional(),
  Instructions: z.array(z.object({})),
});

export type ConnectionSchema = z.infer<typeof connectionSchema>;

export type WorldSchema = z.infer<typeof worldSchema>;
