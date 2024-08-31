import {z} from 'zod';

const mxGeometrySchema = z
  .object({
    _attributes: z.object({
      x: z.string().optional(),
      y: z.string().optional(),
      width: z.string().optional(),
      height: z.string().optional(),
      relative: z.string().optional(),
      as: z.string(),
    }),
  })
  .optional();

const mxCellSchema = z.object({
  _attributes: z.object({
    id: z.string(),
    value: z.string().optional(),
    style: z.string().optional(),
    parent: z.string().optional(),
    vertex: z.string().optional(),
    edge: z.string().optional(),
    source: z.string().optional(),
    target: z.string().optional(),
  }),
  mxGeometry: mxGeometrySchema.optional(),
});

const rootSchema = z.object({
  mxCell: z.array(mxCellSchema),
});

const mxGraphModelSchema = z.object({
  _attributes: z.object({
    dx: z.string(),
    dy: z.string(),
    grid: z.string(),
    gridSize: z.string(),
    guides: z.string(),
    tooltips: z.string(),
    connect: z.string(),
    arrows: z.string(),
    fold: z.string(),
    page: z.string(),
    pageScale: z.string(),
    pageWidth: z.string(),
    pageHeight: z.string(),
    math: z.string(),
    shadow: z.string(),
  }),
  root: rootSchema,
});

export const nodeEditSchema = z.object({
  Id: z.number().int().optional(),
  OriginalId: z.string().optional(),
  ProductionName: z.string().optional(),
  ProductionArguments: z.string().optional(),
  Type: z.string(),
  MainStory: z.boolean().optional(),
});

export const questSchema = z.object({
  mxGraphModel: mxGraphModelSchema,
});

export const createQuestSchema = z.object({
  worldId: z.string(),
  questName: z.string().min(1, 'Nazwa misji jest wymagana'),
});

export type QuestSchema = z.infer<typeof questSchema>;
export type MxCellSchema = z.infer<typeof mxCellSchema>;
export type NodeEditSchema = z.infer<typeof nodeEditSchema>;
export type CreateQuestSchema = z.infer<typeof createQuestSchema>;
