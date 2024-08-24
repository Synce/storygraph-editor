/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable import/no-unused-modules */
import {type QuestNode, type QuestNodeType} from '@prisma/client';

import {createTRPCRouter, publicProcedure} from '@/server/api/trpc';
import {type MxCellSchema, questSchema} from '@schemas/questSchema';

const findSourceOnlyNode = (
  nodes: QuestNode[],
  connections: any[],
  questId: number,
): QuestNode | null => {
  // Ograniczamy przeszukiwanie tylko do węzłów i połączeń związanych z podanym questId
  const relevantNodes = nodes.filter(node => node.questId === questId);
  const relevantConnections = connections.filter(connection => {
    const sourceNode = relevantNodes.find(
      node => node.id === connection.sourceNodeId,
    );
    return !!sourceNode;
  });

  // Zbierz wszystkie sourceNodeId z odpowiednich połączeń
  const sourceNodeIds = new Set(
    relevantConnections.map(conn => conn.sourceNodeId),
  );

  // Zbierz wszystkie originalId z odpowiednich połączeń (destinationId odnosi się do originalId)
  const targetNodeIds = new Set(
    relevantConnections.map(conn => {
      const originalId = conn.destinationId;
      return relevantNodes.find(node => node.originalId === originalId)?.id;
    }),
  );

  // Znajdź nodeId, które jest w sourceNodeIds, ale nie ma go w targetNodeIds
  const sourceOnlyNodeId = Array.from(sourceNodeIds).find(
    id => !targetNodeIds.has(id),
  );

  // Zwróć węzeł, który spełnia warunki, lub null jeśli taki nie istnieje
  return sourceOnlyNodeId
    ? relevantNodes.find(node => node.id === sourceOnlyNodeId) ?? null
    : null;
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

  // 'generic_production' dla 'rounded=0' bez 'ellipse'
  if (style.includes('rounded=0') && !style.includes('ellipse')) {
    if (style.includes('fillcolor=#ffffff') || !style.includes('fillcolor'))
      return 'generic_production';
    if (style.includes('fillcolor=#fff2cc')) return 'start';
  }

  // 'generic_production' dla braku 'fillcolor', 'rounded', 'ellipse'
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

export const questLoaderRouter = createTRPCRouter({
  loadQuest: publicProcedure
    .input(questSchema)
    .mutation(async ({ctx, input}) => {
      const {mxGraphModel, fileName} = input;
      const {root} = mxGraphModel;

      const createdQuest = await ctx.db.quest.create({
        data: {
          name: fileName,
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

      const startNode = await ctx.db.questNode.findFirst({
        where: {type: 'start', questId: createdQuest.id},
      });

      const nodeIds = createdNodes.map(node => node.id);

      const allConnections = await ctx.db.questConnection.findMany({
        where: {
          sourceNodeId: {
            in: nodeIds,
          },
        },
      });

      const sourceOnlyNode = findSourceOnlyNode(
        createdNodes,
        allConnections,
        createdQuest.id,
      );

      if (sourceOnlyNode && startNode) {
        await ctx.db.questConnection.create({
          data: {
            sourceNodeId: startNode.id,
            destinationId: sourceOnlyNode.originalId,
          },
        });
      }

      return ctx.db.quest.findFirst({
        where: {id: createdQuest.id},
        include: {questNodes: {include: {connections: true}}},
      });

      // return createdQuest;
    }),
});
