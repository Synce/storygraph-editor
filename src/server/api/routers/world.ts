import {z} from 'zod';

import {createTRPCRouter, publicProcedure} from '@/server/api/trpc';
import {editLocationSchema} from '@schemas/EditLocationSchema';
import {
  type NarrationSchema,
  worldSchema,
  type ItemSchema,
  type CharacterSchema,
  type ConnectionSchema,
  type LocationSchema,
} from '@schemas/worldSchema';

export const worldRouter = createTRPCRouter({
  loadWorld: publicProcedure
    .input(worldSchema)
    .mutation(async ({ctx, input}) => {
      const {LSide, RSide, Instructions, Preconditions, ...world} = input;

      const createNarration = (Narration?: NarrationSchema[]) => {
        if (!Narration) return undefined;

        return {
          createMany: {
            data: Narration.map(({Id, ...rest}) => ({GivenId: Id, ...rest})),
          },
        };
      };

      const createConnections = (Connections?: ConnectionSchema[]) => {
        if (!Connections) return undefined;
        return {
          createMany: {
            data: Connections,
          },
        };
      };

      const createItems = async (items: ItemSchema[]) => {
        const createItemRecursively = async (item: ItemSchema) => {
          const createdItem = await ctx.db.item.create({
            data: {
              GivenId: item.Id,
              Name: item.Name,
              Attributes: item.Attributes,
              Narration: createNarration(item.Narration),
            },
          });

          if (item.Items && item.Items.length > 0) {
            const subItems = await Promise.all(
              item.Items.map(subItem => createItemRecursively(subItem)),
            );
            await ctx.db.item.update({
              where: {Id: createdItem.Id},
              data: {
                SubItems: {
                  connect: subItems.map(subItem => ({Id: subItem.Id})),
                },
              },
            });
          }

          return createdItem;
        };

        // Rozpoczęcie  tworzenia obiektów Item
        return Promise.all(items.map(item => createItemRecursively(item)));
      };
      const createCharacters = async (characters: CharacterSchema[]) => {
        const createCharacterRecursively = async (
          character: CharacterSchema,
        ) => {
          const createdCharacter = await ctx.db.character.create({
            data: {
              GivenId: character.Id,
              Name: character.Name,
              Comment: character.Comment,
              IsObject: character.IsObject,
              Attributes: character.Attributes,
              Narration: createNarration(character.Narration),
            },
          });

          if (character.Items && character.Items.length > 0) {
            const items = await createItems(character.Items);

            await ctx.db.character.update({
              where: {Id: createdCharacter.Id},
              data: {
                Items: {
                  connect: items.map(item => ({Id: item.Id})),
                },
              },
            });
          }

          return createdCharacter;
        };

        return Promise.all(
          characters.map(character => createCharacterRecursively(character)),
        );
      };

      const createLocations = async (locations: LocationSchema[]) => {
        const createLocationRecursively = async (location: LocationSchema) => {
          const createdLocation = await ctx.db.location.create({
            data: {
              GivenId: location.Id,
              Name: location.Name,
              Comment: location.Comment,
              IsObject: location.IsObject,
              Attributes: location.Attributes,
              Narration: createNarration(location.Narration),
              Connections: createConnections(location.Connections),
            },
          });

          if (location.Characters && location.Characters.length > 0) {
            const characters = await createCharacters(location.Characters);

            await ctx.db.location.update({
              where: {Id: createdLocation.Id},
              data: {
                Characters: {
                  connect: characters.map(character => ({Id: character.Id})),
                },
              },
            });
          }
          if (location.Items && location.Items.length > 0) {
            const items = await createItems(location.Items);

            await ctx.db.location.update({
              where: {Id: createdLocation.Id},
              data: {
                Items: {
                  connect: items.map(item => ({Id: item.Id})),
                },
              },
            });
          }

          return createdLocation;
        };

        return Promise.all(
          locations.map(location => createLocationRecursively(location)),
        );
      };

      const createdWorld = await ctx.db.world.create({
        data: {
          ...world,
        },
      });

      const locations = await createLocations(LSide.Locations);

      await ctx.db.world.update({
        where: {Id: createdWorld.Id},
        data: {
          Locations: {
            connect: locations.map(location => ({Id: location.Id})),
          },
        },
      });
      return createdWorld;
    }),

  getWorld: publicProcedure
    .input(z.object({Id: z.string()}))
    .query(({ctx, input}) => {
      return ctx.db.world.findFirst({
        where: {
          Id: input.Id,
        },
        include: {
          Locations: {
            include: {
              Characters: {
                include: {
                  Items: {include: {SubItems: true}},
                  Narration: true,
                },
              },
              Items: {include: {SubItems: true, Narration: true}},
              Connections: true,
              Narration: true,
            },
          },
        },
      });
    }),

  getWorldMap: publicProcedure
    .input(z.object({Id: z.string()}))
    .query(async ({ctx, input}) => {
      const locations = await ctx.db.location.findMany({
        where: {
          worldId: input.Id,
        },
        include: {
          Connections: true,
        },
      });
      const nodes = locations.map(({GivenId, Id, Name}) => ({
        id: GivenId,
        type: 'location',
        data: {
          Id,
          GivenId,
          Name,
        },
        position: {
          x: Math.random() * 100,
          y: Math.random() * 100,
        },
      }));
      const edges = locations.reduce(
        (acc, location) => {
          if (location.Connections) {
            const locationEdges = location.Connections.map(connection => ({
              id: connection.Id,
              source: location.GivenId,
              target: connection.Destination,
            }));
            return [...acc, ...locationEdges];
          }
          return acc;
        },
        [] as {
          id: string;
          source: string;
          target: string;
        }[],
      );
      return {nodes, edges};
    }),

  getLocation: publicProcedure
    .input(z.object({Id: z.string()}))
    .query(async ({ctx, input}) => {
      return ctx.db.location.findFirst({
        where: {
          Id: input.Id,
        },
        include: {
          Connections: true,
          Items: true,
          Narration: true,
          Characters: true,
        },
      });
    }),

  addLocation: publicProcedure
    .input(z.object({Id: z.string()}))
    .mutation(async ({ctx, input}) => {
      const location = await ctx.db.location.create({
        data: {
          worldId: input.Id,
          Name: 'Brak nazwy',
        },
      });

      return {
        id: location.GivenId,
        type: 'location',
        data: {
          Id: location.Id,
          GivenId: location.GivenId,
          Name: location.Name,
        },
        position: {
          x: Math.random() * 100,
          y: Math.random() * 100,
        },
      };
    }),

  updateLocation: publicProcedure
    .input(editLocationSchema)
    .mutation(async ({ctx, input}) => {
      const {Id, ...data} = input;
      return ctx.db.location.update({
        where: {
          Id,
        },
        data,
      });
    }),

  addConnection: publicProcedure
    .input(
      z.object({
        sourceId: z.string(),
        targetId: z.string(),
        worldId: z.string(),
      }),
    )
    .mutation(async ({ctx, input}) => {
      const location = await ctx.db.location.findFirstOrThrow({
        where: {worldId: input.worldId, GivenId: input.sourceId},
      });
      return ctx.db.location.update({
        where: {
          Id: location.Id,
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
        worldId: z.string(),
      }),
    )
    .mutation(async ({ctx, input}) => {
      const location = await ctx.db.location.findFirstOrThrow({
        where: {worldId: input.worldId, GivenId: input.sourceId},
      });

      return ctx.db.connection.deleteMany({
        where: {
          Destination: input.targetId,
          locationId: location.Id,
        },
      });
    }),

  removeLocation: publicProcedure
    .input(z.object({Id: z.string()}))
    .mutation(async ({ctx, input}) => {
      return ctx.db.location.delete({
        where: {
          Id: input.Id,
        },
        include: {
          Characters: {
            include: {
              Items: {include: {SubItems: true}},
              Narration: true,
            },
          },
          Items: {include: {SubItems: true, Narration: true}},
          Connections: true,
          Narration: true,
        },
      });
    }),
});
