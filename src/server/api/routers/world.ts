import {type WorldNodeType} from '@prisma/client';
import {z} from 'zod';

import {createTRPCRouter, publicProcedure} from '@/server/api/trpc';
import {addNodeSchema, editNodeSchema} from '@schemas/worldInputApiSchemas';
import {getWorldNodePayload} from '@utils/misc';

import {
  type WorldNodeChildren,
  type WorldNodeWithPayload,
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
    .input(z.object({worldNodeId: z.number()}))
    .query(async ({ctx, input}) => {
      // @ts-expect-error package has bad typing
      const worldNode: WorldNodeWithPayload = ctx.db.worldNode.findFirstOrThrow(
        {
          where: {id: input.worldNodeId},
          include: {
            location: true,
            character: true,
            item: true,
            narration: true,
          },
        },
      );

      const childrenNodes = await ctx.db.worldNode.findChildren({
        where: {id: input.worldNodeId},
        include: {
          location: true,
          character: true,
          item: true,
          narration: true,
        },
      });

      if (!childrenNodes) throw new Error(`Not found`);
      const typedChildrenNodes = childrenNodes as WorldNodeWithPayload[];

      const children = typedChildrenNodes.reduce((acc, node) => {
        const payload = {...getWorldNodePayload(node), worldNodeId: node.id};
        if (node.type === 'World') return acc;
        const arr = acc[node.type] ?? [];

        // @ts-expect-error type guard by node.type
        acc[node.type] = arr.push(payload);
        return acc;
      }, {} as WorldNodeChildren);

      return {
        worldNodeId: worldNode.id,
        ...getWorldNodePayload(worldNode),
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

      if (Type === 'Character')
        return ctx.db.character.update({
          where: {
            Id,
          },
          data: {
            ...data,
            Attributes: parsedAttributes,
          },
        });

      if (Type === 'Item')
        return ctx.db.item.update({
          where: {
            Id,
          },
          data: {
            ...data,
            Attributes: parsedAttributes,
          },
        });

      if (Type === 'Narration')
        return ctx.db.narration.update({
          where: {
            Id,
          },
          data: {
            ...data,
            Attributes: parsedAttributes,
          },
        });

      return ctx.db.location.update({
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
      const sourceLocation = await ctx.db.location.findFirstOrThrow({
        where: {
          Id: input.sourceId,
        },
      });

      await ctx.db.location.findFirstOrThrow({
        where: {
          Id: input.targetId,
        },
      });

      const existingConnection = await ctx.db.connection.findFirst({
        where: {
          locationId: input.sourceId,
          Destination: input.targetId,
        },
      });

      if (existingConnection) {
        throw new Error('Już istnieje takie połączenie');
      }

      return ctx.db.location.update({
        where: {
          Id: sourceLocation.Id,
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
          locationId: input.sourceId,
        },
      });
    }),

  removeNode: publicProcedure
    .input(
      z.object({
        worldNodeId: z.number(),
      }),
    )
    .mutation(async ({ctx, input}) => {
      return ctx.db.worldNode.deleteNode({
        where: {
          id: input.worldNodeId,
        },
      });
    }),

  addNode: publicProcedure
    .input(addNodeSchema)
    .mutation(async ({ctx, input}) => {
      const type = input.Type.toLowerCase() as Uncapitalize<WorldNodeType>;

      return ctx.db.worldNode.createChild({
        where: {id: input.parentWorldNodeId},
        data: {
          type: input.Type,
          [type]: {
            create: {
              Name: 'Brak nazwy',
            },
          },
        },
        include: {
          location: true,
          character: true,
          item: true,
          narration: true,
        },
      });
    }),
});
