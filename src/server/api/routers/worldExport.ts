import {type WorldNodeType, type Connection} from '@prisma/client';
import {z} from 'zod';

import {createTRPCRouter, publicProcedure} from '@/server/api/trpc';
import {type WorldSchema, type NodeSchema} from '@schemas/worldSchema';
import {getWorldNodePayload} from '@utils/misc';

import {type WorldNodeWithOptionalPayload} from '../interfaces/IWorldApi';

export const worldExportRouter = createTRPCRouter({
  exportJSON: publicProcedure
    .input(
      z.object({
        Id: z.string(),
      }),
    )
    .query(async ({ctx, input}) => {
      const worldData = await ctx.db.world.findUniqueOrThrow({
        where: {Id: input.Id},
      });

      const mapNodeRecursive = async (
        worldNode: WorldNodeWithOptionalPayload,
      ) => {
        const content = getWorldNodePayload(worldNode);
        // @ts-expect-error może posiadać połączenia
        const connections = content?.Connections as Connection[] | undefined;

        const node: NodeSchema & {type: WorldNodeType} = {
          Name: content?.Name ?? undefined,
          Id: content?.Id ?? undefined,
          Comment: content?.Comment ?? undefined,
          IsObject: content?.IsObject ?? undefined,
          Attributes: content?.Attributes ?? undefined,
          type: worldNode.type,
        };
        if (connections) {
          node.Connections = connections?.map(conn => ({
            Destination: conn.Destination,
            Attributes: conn.Attributes ?? undefined,
          }));
        }

        const children = await ctx.db.worldNode.findChildren({
          where: {id: worldNode.id},
          include: {
            WorldContent: true,
          },
        });

        const typedChildren = (children ??
          []) as WorldNodeWithOptionalPayload[];

        if (typedChildren.length > 0) {
          const mappedChildren = await Promise.all(
            typedChildren.map(child => mapNodeRecursive(child)),
          );

          node.Characters = mappedChildren
            .filter(child => child.type === 'Character')
            .map(({type, ...node}) => node);
          node.Items = mappedChildren
            .filter(child => child.type === 'Item')
            .map(({type, ...node}) => node);
          node.Narration = mappedChildren
            .filter(child => child.type === 'Narration')
            .map(({type, ...node}) => node);
        }

        return node;
      };

      const rootNode = await ctx.db.worldNode.findFirstOrThrow({
        where: {worldId: input.Id, type: 'World'},
      });

      const locationNodes = await ctx.db.worldNode.findChildren({
        node: rootNode,
        include: {
          WorldContent: {
            include: {
              Connections: true,
            },
          },
        },
      });

      const typedLocationNodes = (locationNodes ??
        []) as WorldNodeWithOptionalPayload[];

      const locationMappedNodes = await Promise.all(
        typedLocationNodes.map(rootNode => mapNodeRecursive(rootNode)),
      );

      const worldSchemaData: WorldSchema = {
        Title: worldData.Title,
        TitleGeneric: worldData.TitleGeneric,
        Description: worldData.Description,
        Override: worldData.Override,
        LSide: {
          Locations: locationMappedNodes.map(({type, ...node}) => node),
        },
        RSide: {},
        Instructions: [],
      };

      return [worldSchemaData];
    }),
});
