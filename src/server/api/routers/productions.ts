import {z} from 'zod';

import {createTRPCRouter, publicProcedure} from '@/server/api/trpc';
import {
  productionEditSchema,
  productionSchema,
} from '@schemas/productionSchema';

type Node = {
  id: string;
  type: string;
  data: {
    Id: string;
    Title: string | null;
    Generic: boolean;
  };
};

type Edge = {
  id: string;
  source: string;
  target: string;
};

export const productionsRouter = createTRPCRouter({
  loadProductions: publicProcedure
    .input(
      z.object({
        worldId: z.string(),
        productions: z.array(productionSchema),
        generic: z.boolean(),
      }),
    )
    .mutation(({ctx, input}) => {
      const data = input.productions.map(production => ({
        Title: production.Title,
        TitleGeneric: production.TitleGeneric,
        Description: production.Description,
        Override: production.Override,
        LSide: production.LSide || undefined,
        Instructions: production.Instructions || undefined,
        worldId: input.worldId,
        Generic: input.generic,
      }));

      return ctx.db.production.createMany({
        data,
      });
    }),
  getMap: publicProcedure
    .input(
      z.object({
        worldId: z.string(),
      }),
    )
    .query(async ({ctx, input}) => {
      const productions = await ctx.db.production.findMany({
        where: {worldId: input.worldId},
      });

      const nodes: Node[] = productions.map(production => ({
        id: production.Id,
        type: 'production',
        data: {
          Id: production.Id,
          Title: production.Title,
          Generic: production.Generic,
        },
      }));

      const edges: Edge[] = [];

      productions.forEach(sourceProduction => {
        productions.forEach(targetProduction => {
          if (
            targetProduction.TitleGeneric === sourceProduction.Title &&
            sourceProduction.Id !== targetProduction.Id
          ) {
            edges.push({
              id: `${sourceProduction.Id}-${targetProduction.Id}`,
              source: sourceProduction.Id,
              target: targetProduction.Id,
            });
          }
        });
      });

      return {nodes, edges};
    }),
  getProduction: publicProcedure
    .input(
      z.object({
        Id: z.string(),
      }),
    )
    .query(async ({ctx, input}) => {
      return ctx.db.production.findFirstOrThrow({
        where: {Id: input.Id},
      });
    }),

  getProductions: publicProcedure
    .input(
      z.object({
        worldId: z.string(),
      }),
    )
    .query(async ({ctx, input}) => {
      return ctx.db.production.findMany({
        where: {worldId: input.worldId},
      });
    }),
  createProduction: publicProcedure
    .input(z.object({worldId: z.string(), production: productionEditSchema}))
    .mutation(async ({ctx, input}) => {
      const {Id, ...data} = input.production;
      return ctx.db.production.create({
        data: {
          ...data,
          LSide: JSON.parse(data.LSide),
          Instructions: JSON.parse(data.Instructions),
          Generic: false,
          worldId: input.worldId,
        },
      });
    }),
});
