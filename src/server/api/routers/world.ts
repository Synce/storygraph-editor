import {z} from 'zod';

import {createTRPCRouter, publicProcedure} from '@/server/api/trpc';
import {addNodeSchema, editNodeSchema} from '@schemas/worldInputApiSchemas';
import {getWorldNodePayload} from '@utils/misc';

import {
  type WorldNodeWithPayload,
  type WorldNodeChildren,
  type WorldNodeWithOptionalPayload,
} from '../interfaces/IWorldApi';

export const worldRouter = createTRPCRouter({
  getWorld: publicProcedure
    .input(z.object({Id: z.string()}))
    .query(({ctx, input}) => {
      return ctx.db.world.findFirst({
        where: {
          Id: input.Id,
        },
      });
    }),
  getNode: publicProcedure
    .input(z.object({Id: z.string()}))
    .query(async ({ctx, input}) => {
      const contentNode = await ctx.db.worldContent.findFirstOrThrow({
        where: {Id: input.Id},
      });

      const childrenNodes = await ctx.db.worldNode.findChildren({
        where: {id: contentNode.worldNodeId},
        include: {
          WorldContent: true,
        },
      });

      const typedChildrenNodes = (childrenNodes ??
        []) as WorldNodeWithOptionalPayload[];

      const children = typedChildrenNodes.reduce(
        (acc, node) => {
          const payload = getWorldNodePayload(node);
          if (node.type === 'World') return acc;
          const arr = acc[node.type] ?? [];

          acc[node.type] = [...arr, payload];
          return acc;
        },
        {
          Character: [],
          Item: [],
          Narration: [],
          Location: [],
          World: [],
        } as WorldNodeChildren,
      );

      return {
        ...contentNode,
        ...children,
      };
    }),

  updateNode: publicProcedure
    .input(editNodeSchema)
    .mutation(async ({ctx, input}) => {
      const {Id, Attributes, Type, ...data} = input;

      const parsedAttributes = Attributes?.reduce((acc, attribute) => {
        acc[attribute.key] = attribute.value;
        return acc;
      }, {} as PrismaJson.Attributes);

      return ctx.db.worldContent.update({
        where: {
          Id,
        },
        data: {
          ...data,
          Attributes: parsedAttributes,
        },
      });
    }),

  addConnection: publicProcedure
    .input(
      z.object({
        sourceId: z.string(),
        targetId: z.string(),
      }),
    )
    .mutation(async ({ctx, input}) => {
      const source = await ctx.db.worldContent.findFirstOrThrow({
        where: {
          Id: input.sourceId,
        },
        include: {
          WorldNode: true,
        },
      });

      const target = await ctx.db.worldContent.findFirstOrThrow({
        where: {
          Id: input.targetId,
        },
        include: {
          WorldNode: true,
        },
      });
      if (
        source.WorldNode.type !== 'Location' ||
        target.WorldNode.type !== 'Location'
      )
        throw new Error('Można łączyć tylko dwie lokacje');

      const existingConnection = await ctx.db.connection.findFirst({
        where: {
          worldContentId: input.sourceId,
          Destination: input.targetId,
        },
      });

      if (existingConnection) {
        throw new Error('Już istnieje takie połączenie');
      }

      return ctx.db.worldContent.update({
        where: {
          Id: source.Id,
        },
        data: {
          Connections: {create: {Destination: input.targetId}},
        },
      });
    }),

  removeConnection: publicProcedure
    .input(
      z.object({
        sourceId: z.string(),
        targetId: z.string(),
      }),
    )
    .mutation(async ({ctx, input}) => {
      return ctx.db.connection.deleteMany({
        where: {
          Destination: input.targetId,
          worldContentId: input.sourceId,
        },
      });
    }),

  removeNode: publicProcedure
    .input(
      z.object({
        Id: z.string(),
      }),
    )
    .mutation(async ({ctx, input}) => {
      const content = ctx.db.worldContent.findFirstOrThrow({
        where: {
          Id: input.Id,
        },
      });

      return ctx.db.worldNode.deleteNode({
        where: {
          id: (await content).worldNodeId,
        },
      });
    }),

  addNode: publicProcedure.input(addNodeSchema).mutation(({ctx, input}) => {
    return ctx.db.worldNode.createChild({
      where: {id: input.parentWorldNodeId},
      data: {
        type: input.Type,
        WorldContent: {
          create: {
            Name: 'Brak nazwy',
          },
        },
      },
      include: {
        WorldContent: true,
      },
    }) as unknown as WorldNodeWithPayload;
  }),
});
