/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable import/no-unused-modules */
import {type QuestNode, QuestNodeType} from '@prisma/client';
import {z} from 'zod';

import {createTRPCRouter, publicProcedure} from '@/server/api/trpc';
import {type MxCellSchema, questSchema} from '@schemas/questSchema';

type Node = {
  id: string;
  type: string;
  data: {
    Id: number;
    OriginalId: string;
    ProductionName: string | null;
    ProductionArguments: string | null;
    MainStory: boolean;
    Type: string;
  };
};

const determineNodeType = (cell: MxCellSchema): QuestNodeType => {
  const style = (cell._attributes.style ?? '').toLowerCase();

  // Sprawdzanie warunków związanych z 'ellipse'
  if (style.includes('ellipse')) {
    if (style.includes('fillcolor=#fff2cc')) return 'success';
    if (style.includes('fillcolor=#000000')) return 'death';
    if (style.includes('fillcolor=none') || !style.includes('fillcolor'))
      return 'defeat';
  }

  // Inne typy produkcji na podstawie koloru i obramowania
  if (
    style.includes('fillcolor=#d5e8d4') &&
    style.includes('strokecolor=#82b366')
  ) {
    return 'custom_production';
  }

  if (
    style.includes('fillcolor=#e1d5e7') &&
    style.includes('strokecolor=#9673a6')
  ) {
    return 'other_quest';
  }

  if (
    style.includes('rounded=0') &&
    !style.includes('ellipse') &&
    (style.includes('fillcolor=#ffffff') || !style.includes('fillcolor'))
  ) {
    return 'generic_production';
  }

  if (
    (!style.includes('fillcolor') &&
      (!style.includes('rounded') || !style.includes('ellipse'))) ||
    (style.includes('fillcolor=#ffffff') &&
      (!style.includes('rounded') || !style.includes('ellipse')))
  ) {
    return 'generic_production';
  }

  return 'unknown';
};

const getProductionNameAndArguments = (cell: MxCellSchema) => {
  const value = cell._attributes.value ?? '';

  // Usuwamy wszystkie znaczniki HTML (<>)
  let cleanedValue = value.replace(/<[^>]*>/g, '');

  // Usuwamy wszystkie twarde spacje (&nbsp;)
  cleanedValue = cleanedValue.replace(/&nbsp;/g, ' ');

  // Dzielimy tekst na części na podstawie średnika
  const parts = cleanedValue.split(';');

  const productionName = parts[0] ?? '';
  const productionArguments = parts[1] ?? '';

  return [productionName, productionArguments];
};

const findMainStoryCell = (
  allCells: MxCellSchema[],
): MxCellSchema | undefined => {
  return allCells.find(
    cell =>
      cell._attributes.style?.includes('rounded=0') &&
      cell._attributes.style?.includes('fillColor=#fff2cc'),
  );
};

const isMainStory = (
  cell: MxCellSchema,
  mainStoryCell: MxCellSchema,
): boolean => {
  const cellGeometry = cell.mxGeometry?._attributes;
  const cellX = parseFloat(cellGeometry?.x ?? '0');
  const cellY = parseFloat(cellGeometry?.y ?? '0');

  const mainStoryGeometry = mainStoryCell.mxGeometry?._attributes;
  const mainStoryX = parseFloat(mainStoryGeometry?.x ?? '0');
  const mainStoryY = parseFloat(mainStoryGeometry?.y ?? '0');
  const mainStoryWidth = parseFloat(mainStoryGeometry?.width ?? '0');
  const mainStoryHeight = parseFloat(mainStoryGeometry?.height ?? '0');

  return (
    cellX >= mainStoryX &&
    cellX <= mainStoryX + mainStoryWidth &&
    cellY >= mainStoryY &&
    cellY <= mainStoryY + mainStoryHeight
  );
};

const getNodeId = (
  originalId: string,
  createdNodes: QuestNode[],
): number | null => {
  const node = createdNodes.find(n => n.originalId === originalId);
  return node ? node.id : null;
};

export const questsRouter = createTRPCRouter({
  loadQuestFile: publicProcedure
    .input(
      z.object({
        worldId: z.string(),
        quest: questSchema,
        fileName: z.string(),
      }),
    )
    .mutation(async ({ctx, input}) => {
      const {mxGraphModel} = input.quest;
      const {root} = mxGraphModel;

      const createdQuest = await ctx.db.quest.create({
        data: {
          name: input.fileName,
          worldId: input.worldId,
        },
      });

      const allCells = root.mxCell;

      const mainStoryCell = findMainStoryCell(allCells);

      const questNodes = allCells
        .filter(cell => cell._attributes.vertex === '1')
        .map(cell => ({
          originalId: cell._attributes.id,
          type: determineNodeType(cell),
          productionName: getProductionNameAndArguments(cell)[0],
          productionArguments: getProductionNameAndArguments(cell)[1],
          questId: createdQuest.id,
          isMainStory: mainStoryCell ? isMainStory(cell, mainStoryCell) : false,
        }));

      await ctx.db.questNode.createMany({
        data: questNodes,
      });

      const createdNodes = await ctx.db.questNode.findMany({
        where: {
          questId: createdQuest.id,
          quest: {
            worldId: input.worldId,
          },
        },
      });

      const questConnections = root.mxCell
        .filter(cell => cell._attributes.edge === '1')
        .map(cell => ({
          sourceNodeId: getNodeId(cell._attributes.source ?? '', createdNodes),
          destinationId: cell._attributes.target,
        }))
        .filter(connection => connection.sourceNodeId !== null);

      await ctx.db.questConnection.createMany({
        // @ts-expect-error typing error
        data: questConnections,
      });

      if (mainStoryCell) {
        const nodeToDelete = await ctx.db.questNode.findFirst({
          where: {
            originalId: mainStoryCell._attributes.id,
            questId: createdQuest.id,
          },
        });

        if (nodeToDelete) {
          await ctx.db.questNode.delete({
            where: {
              id: nodeToDelete.id,
            },
          });
        }
      }
    }),
  getQuests: publicProcedure
    .input(
      z.object({
        worldId: z.string(),
      }),
    )
    .query(async ({ctx, input}) => {
      return ctx.db.quest.findMany({
        where: {worldId: input.worldId},
      });
    }),
  getSelectedQuestMap: publicProcedure
    .input(
      z.object({
        questId: z.string(),
      }),
    )
    .query(async ({ctx, input}) => {
      const questNodes: QuestNode[] = await ctx.db.questNode.findMany({
        where: {
          questId: input.questId,
        },
      });

      const nodes: Node[] = questNodes.map(node => ({
        id: node.originalId,
        type: node.type,
        data: {
          Id: node.id,
          OriginalId: node.originalId,
          ProductionName: node.productionName,
          ProductionArguments: node.productionArguments,
          MainStory: node.isMainStory,
          Type: node.type,
        },
      }));

      const connections = await ctx.db.questConnection.findMany({
        where: {
          sourceNodeId: {
            in: nodes.map(node => node.data.Id),
          },
        },
      });

      const edges = connections.map(connection => {
        const sourceNode = nodes.find(
          node => node.data.Id === connection.sourceNodeId,
        );
        const destinationNode = nodes.find(
          node => node.data.OriginalId === connection.destinationId,
        );

        return {
          id:
            `${sourceNode?.data.OriginalId}-${destinationNode?.data.OriginalId}` ??
            '',
          source: sourceNode?.data.OriginalId ?? '',
          target: destinationNode?.data.OriginalId ?? '',
        };
      });

      return {
        nodes,
        edges,
      };
    }),
  getNode: publicProcedure
    .input(
      z.object({
        worldId: z.string(),
        questId: z.string(),
        nodeId: z.string(),
      }),
    )
    .query(async ({ctx, input}) => {
      return ctx.db.questNode.findFirstOrThrow({
        where: {
          originalId: input.nodeId,
          questId: input.questId,
          quest: {
            worldId: input.worldId,
          },
        },
      });
    }),
  getQuestNodeTypes: publicProcedure.query(() => {
    return Object.values(QuestNodeType);
  }),
  deleteQuest: publicProcedure
    .input(
      z.object({
        worldId: z.string(),
        questId: z.string(),
      }),
    )
    .mutation(async ({ctx, input}) => {
      const deletedQuest = await ctx.db.quest.deleteMany({
        where: {
          id: input.questId,
          worldId: input.worldId,
        },
      });

      return {count: deletedQuest.count};
    }),
});
