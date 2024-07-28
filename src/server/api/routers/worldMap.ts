import {type Node, type Edge} from 'reactflow';
import {z} from 'zod';

import {createTRPCRouter, publicProcedure} from '@/server/api/trpc';
import {getWorldNodePayload} from '@utils/misc';

import {type WorldNodeWithOptionalPayload} from '../interfaces/IWorldApi';

export const worldMapRouter = createTRPCRouter({
  getWorldMap: publicProcedure
    .input(
      z.object({
        Id: z.string(),
      }),
    )
    .query(async ({ctx, input}) => {
      const node = await ctx.db.worldNode.findFirstOrThrow({
        where: {worldId: input.Id, depth: 1},
      });

      const worldNodes = await ctx.db.worldNode.findChildren({
        node,
        include: {
          WorldContent: true,
        },
      });

      const typedWorldNodes = (worldNodes ??
        []) as WorldNodeWithOptionalPayload[];

      const locationIds = typedWorldNodes
        .filter(x => x.type === 'Location' && x.WorldContent)
        .map(x => x.WorldContent?.Id) as string[];

      const locations = await ctx.db.worldContent.findMany({
        where: {
          Id: {
            in: locationIds,
          },
        },
        include: {
          Connections: true,
        },
      });

      const nodes = locations.map(location => {
        return {
          id: location.Id,
          type: 'worldNode',
          data: {
            Id: location.Id,
            Name: location.Name,
            Type: 'Location',
          },
          position: {
            x: Math.random() * 100,
            y: Math.random() * 100,
          },
        };
      });
      const edges = locations.reduce((acc, location) => {
        if (location.Connections) {
          const locationEdges = location.Connections.map(connection => ({
            id: connection.Id,
            source: location.Id,
            target: connection.Destination,
          }));
          return [...acc, ...locationEdges];
        }
        return acc;
      }, [] as Edge[]);
      return {nodes, edges};
    }),
  getWorldNodesMap: publicProcedure
    .input(
      z.object({
        Id: z.string(),
      }),
    )
    .query(async ({ctx, input}) => {
      const node = await ctx.db.worldNode.findFirstOrThrow({
        where: {worldId: input.Id, depth: 1},
      });

      const worldNodes = await ctx.db.worldNode.findDescendants({
        node,
        include: {
          WorldContent: true,
        },
      });

      const typedWorldNodes = (worldNodes ??
        []) as WorldNodeWithOptionalPayload[];
      const edges: Edge[] = [];
      const nodes: Node[] = [];

      const locationIds = typedWorldNodes
        .filter(x => x.type === 'Location' && x.WorldContent)
        .map(x => x.WorldContent?.Id) as string[];

      const locations = await ctx.db.worldContent.findMany({
        where: {
          Id: {
            in: locationIds,
          },
        },
        include: {
          Connections: true,
        },
      });

      locations.forEach(location => {
        if (!location.Connections) return;

        const locationEdges = location.Connections.map(connection => ({
          id: connection.Id,
          source: location.Id,
          target: connection.Destination,
        }));
        edges.push(...locationEdges);
      });

      const createConnections = async (nodeId: number, payloadId: string) => {
        const children = await ctx.db.worldNode.findChildren({
          where: {
            id: nodeId,
          },
          include: {
            WorldContent: true,
          },
        });

        if (!children) return;

        (children as WorldNodeWithOptionalPayload[]).forEach(node => {
          const childrenPayload = getWorldNodePayload(node);
          edges.push({
            id: `${payloadId}-${childrenPayload.Id}`,
            source: payloadId,
            target: childrenPayload.Id,
          });
        });
      };

      const promises = typedWorldNodes.map(node => {
        const payload = getWorldNodePayload(node);

        nodes.push({
          id: payload.Id,
          type: 'worldNode',
          data: {
            Id: payload.Id,
            Name: payload.Name,
            Type: node.type,
          },
          position: {
            x: Math.random() * 100,
            y: Math.random() * 100,
          },
        });

        return createConnections(node.id, payload.Id);
      });

      await Promise.all(promises);
      return {nodes, edges};
    }),
});
