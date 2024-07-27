/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable import/no-unused-modules */

import {type WorldNode, type Prisma} from '@prisma/client';

import {createTRPCRouter, publicProcedure} from '@/server/api/trpc';
import {
  type NarrationSchema,
  worldSchema,
  type ItemSchema,
  type CharacterSchema,
  type ConnectionSchema,
  type LocationSchema,
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

      const createNarration = async (
        narration: NarrationSchema[] | undefined,
        worldId: string,
        parentId: number,
      ) => {
        if (!narration) return;

        for (const narr of narration) {
          await ctx.db.worldNode.createChild({
            where: {id: parentId},
            data: {
              type: 'Narration',
              narration: {
                create: {
                  Id: createUUID(narr.Id, worldId),
                  Name: narr.Name,
                  Attributes: narr.Attributes,
                },
              },
            },
          });
        }
      };

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

      const createItems = async (
        items: ItemSchema[] | undefined,
        worldId: string,
        parentId: number,
      ) => {
        if (!items) return;

        for (const item of items) {
          const node: WorldNode = await ctx.db.worldNode.createChild({
            where: {id: parentId},
            data: {
              type: 'Item',
              item: {
                create: {
                  Id: createUUID(item.Id, worldId),
                  Name: item.Name,
                  Attributes: item.Attributes,
                },
              },
            },
          });

          await createItems(item.Items, worldId, node.id);
          await createNarration(item.Narration, worldId, node.id);
        }
      };

      const createCharacters = async (
        characters: CharacterSchema[] | undefined,
        worldId: string,
        parentId: number,
      ) => {
        if (!characters) return;

        for (const character of characters) {
          const node: WorldNode = await ctx.db.worldNode.createChild({
            where: {id: parentId},
            data: {
              type: 'Character',
              character: {
                create: {
                  Id: createUUID(character.Id, worldId),
                  Name: character.Name,
                  Comment: character.Comment,
                  IsObject: character.IsObject,
                  Attributes: character.Attributes,
                },
              },
            },
          });

          await createItems(character.Items, worldId, node.id);
          await createNarration(character.Narration, worldId, node.id);
        }
      };

      const createLocations = async (
        locations: LocationSchema[],
        worldId: string,
        parentId: number,
      ) => {
        if (!locations) return;

        for (const location of locations) {
          const node: WorldNode = await ctx.db.worldNode.createChild({
            where: {id: parentId},
            data: {
              type: 'Location',
              location: {
                create: {
                  Id: createUUID(location.Id, worldId),
                  Name: location.Name,
                  Comment: location.Comment,
                  IsObject: location.IsObject,
                  Attributes: location.Attributes,
                  Connections: createConnections(location.Connections, worldId),
                },
              },
            },
          });

          await createCharacters(location.Characters, worldId, node.id);
          await createItems(location.Items, worldId, node.id);
          await createNarration(location.Narration, worldId, node.id);
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

      await createLocations(
        LSide.Locations,
        createdWorld.Id,
        createdWorldRoot.id,
      );

      return createdWorld;
    }),
});
