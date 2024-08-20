import {z} from 'zod';

import {worldSchema} from './worldSchema';

const instructionSchema = z.object({
  Op: z.enum([
    'create',
    'delete',
    'move',
    'set',
    'unset',
    'add',
    'mul',
    'winning',
    'copy',
  ]),
  In: z.string().optional(),
  To: z.string().optional(),
  Attribute: z.string().optional(),
  Expr: z.string().optional(),
  Value: z.union([z.string(), z.boolean(), z.number(), z.null()]).optional(),
  CharactersLimiter: z.enum(['prohibit', 'move', 'delete']).optional(),
  ItemsLimiter: z.enum(['prohibit', 'move', 'delete']).optional(),
  ChildrenLimiter: z.enum(['prohibit', 'move', 'delete']).optional(),
  NarrationLimiter: z.enum(['prohibit', 'move', 'delete']).optional(),
  Limit: z.number().int().optional(),
  Count: z.number().int().optional(),
  Sheaf: z.object({}).optional(),
  Node: z.string().optional(),
  Nodes: z.string().optional(),
});

export const productionSchema = worldSchema.extend({
  Instructions: z.array(instructionSchema),
});

export const productionEditSchema = z.object({
  Id: z.string().optional(),
  Title: z.string(),
  TitleGeneric: z.string(),
  Description: z.string(),
  Override: z.number().int(),
  Comment: z.string().optional(),
  LSide: z.string(),
  Preconditions: z.array(z.object({})).optional(),
  Instructions: z.string(),
});

export type ProductionSchema = z.infer<typeof productionSchema>;
export type ProductionEditSchema = z.infer<typeof productionEditSchema>;
