/* eslint-disable import/no-unused-modules */
import {type QuestNodeType} from '@prisma/client';

import {createTRPCRouter, publicProcedure} from '@/server/api/trpc';
import {type MxCellSchema, questSchema} from '@schemas/questSchema';

const determineNodeType = (cell: MxCellSchema): QuestNodeType => {
  const originalId = cell._attributes.value;
  const style = cell._attributes.style ?? '';

  if (originalId === '1') {
    return 'start';
  }

  if (style.includes('ellipse')) {
    if (style.includes('fillColor=#fff2cc')) {
      return 'success';
    }
    if (style.includes('fillColor=#000000')) {
      return 'death';
    }
    if (style.includes('fillColor=none') || !style.includes('fillColor')) {
      return 'defeat';
    }
  }

  if (
    style.includes('fillColor=#d5e8d4') &&
    style.includes('strokeColor=#82b366')
  ) {
    return 'custom_production';
  }

  if (
    style.includes('rounded=0') &&
    (style.includes('fillColor=#ffffff') || !style.includes('fillColor'))
  ) {
    return 'generic_production';
  }

  return 'generic_production';
};

const getProductionNameAndArguments = (cell: MxCellSchema) => {
  const value = cell._attributes.value ?? '';
  const parts = value.split(';');

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

const getNodeId = (originalId: string, createdNodes: any[]): string => {
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

      const createdNodes = await ctx.db.questNode.createMany({
        data: questNodes,
      });

      const questConnections = root.mxCell
        .filter(cell => cell._attributes.edge === '1')
        .map(cell => ({
          sourceNodeId: getNodeId(cell._attributes.source ?? '', createdNodes),
          destinationId: cell._attributes.target,
        }));

      await ctx.db.questConnection.createMany({
        data: questConnections,
      });

      return createdQuest;
    }),
});
