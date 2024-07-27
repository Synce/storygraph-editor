import {
  type WorldContent,
  type Prisma,
  type WorldNodeType,
  type WorldNode,
} from '@prisma/client';

export type WorldNodeWithOptionalPayload = Prisma.WorldNodeGetPayload<{
  include: {WorldContent: true};
}>;

export type WorldNodeWithPayload = WorldNode & {WorldContent: WorldContent};

export type WorldNodeChildren = Record<WorldNodeType, WorldContent[]>;
