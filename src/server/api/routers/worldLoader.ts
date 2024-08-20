/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable import/no-unused-modules */

import {type WorldNode, type Prisma, type WorldNodeType} from '@prisma/client';

import {createTRPCRouter, publicProcedure} from '@/server/api/trpc';
import {
  worldSchema,
  type ConnectionSchema,
  type NodeSchema,
} from '@schemas/worldSchema';
import {seededUUID} from '@utils/misc';

type WorldNodeWithWorld = Prisma.WorldNodeGetPayload<{
  include: {World: true};
}>;

const createUUID = (Id: string | undefined, worldId: string) => {
  if (!Id) return undefined;
  return seededUUID(Id + worldId);
};

export const worldLoaderRouter = createTRPCRouter({
  loadWorld: publicProcedure
    .input(worldSchema)
    .mutation(async ({ctx, input}) => {
      const {LSide, RSide, Instructions, Preconditions, ...world} = input;

      const createConnections = (
        Connections: ConnectionSchema[] | undefined,
        worldId: string,
      ) => {
        if (!Connections) return undefined;

        return {
          createMany: {
            data: Connections.map(connection => ({
              Attributes: connection.Attributes,
              Destination: createUUID(connection.Destination, worldId)!,
            })),
          },
        };
      };

      const createNodes = async (
        nodes: NodeSchema[] | undefined,
        type: WorldNodeType,
        worldId: string,
        parentId: number,
        withConnections?: boolean,
      ) => {
        if (!nodes) return;

        for (const node of nodes) {
          const createdNode: WorldNode = await ctx.db.worldNode.createChild({
            where: {id: parentId},
            data: {
              type,
              WorldContent: {
                create: {
                  Id: createUUID(node.Id, worldId),
                  Name: node.Name,
                  Attributes: node.Attributes,
                  Comment: node.Comment,
                  IsObject: node.IsObject,
                  Connections:
                    type === 'Location' && withConnections
                      ? createConnections(node.Connections, worldId)
                      : undefined,
                },
              },
              World: {
                connect: {
                  Id: worldId,
                },
              },
            },
          });

          await createNodes(node.Items, 'Item', worldId, createdNode.id);
          await createNodes(
            node.Characters,
            'Character',
            worldId,
            createdNode.id,
          );
          await createNodes(
            node.Narration,
            'Narration',
            worldId,
            createdNode.id,
          );
        }
      };

      const createdWorldRoot: WorldNodeWithWorld =
        await ctx.db.worldNode.createRoot({
          data: {
            type: 'World',
            World: {
              create: {
                ...world,
              },
            },
          },
          include: {
            World: true,
          },
        });

      const createdWorld = createdWorldRoot.World!;

      await createNodes(
        LSide.Locations,
        'Location',
        createdWorld.Id,
        createdWorldRoot.id,
        true,
      );

      return createdWorld;
    }),
  createWorld: publicProcedure.mutation(async ({ctx}) => {
    const createdWorldRoot: WorldNodeWithWorld =
      await ctx.db.worldNode.createRoot({
        data: {
          type: 'World',
          World: {
            create: {
              Title: 'Nowy świat',
              TitleGeneric: '',
              Description: '',
              Override: 0,
            },
          },
        },
        include: {
          World: true,
        },
      });

    return createdWorldRoot.World!;
  }),
});
