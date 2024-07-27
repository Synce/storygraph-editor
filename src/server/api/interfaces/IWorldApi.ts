import {
  type Character,
  type Item,
  type Narration,
  type Prisma,
} from '@prisma/client';

export type WorldNodeWithPayload = Prisma.WorldNodeGetPayload<{
  include: {location: true; character: true; narration: true; item: true};
}>;
type WithWorldNodeId<T> = T & {
  worldNodeId: number;
};

export type WorldNodeChildren = {
  Character: WithWorldNodeId<Character>[];
  Item: WithWorldNodeId<Item>[];
  Narration: WithWorldNodeId<Narration>[];
  Location: WithWorldNodeId<Location>[];
};
