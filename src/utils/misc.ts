import {type Prisma} from '@prisma/client';
import seedrandom from 'seedrandom';
import superjson from 'superjson';
import {v4 as uuidv4, type V4Options} from 'uuid';

import {type EditAttributesSchema} from '@schemas/worldInputApiSchemas';

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

export const parseAttributesSchema = (
  attributes: PrismaJson.Attributes | null,
) => {
  return Object.entries(attributes ?? {}).reduce<EditAttributesSchema[]>(
    (acc, item) => {
      const [key, value] = item;
      const type = typeof value;
      const attribute = {key, value, type} as EditAttributesSchema;
      return [...acc, attribute];
    },
    [] as EditAttributesSchema[],
  );
};

export function convertToPlainObject<T>(value: T): T {
  return superjson.parse(superjson.stringify(value));
}

export function seededUUID(seed: string): string {
  const rng = seedrandom(seed);

  function customRandom(bytes: Uint8Array): Uint8Array {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(rng() * 256);
    }
    return bytes;
  }

  const options: V4Options = {
    random: customRandom(new Uint8Array(16)),
  };

  return uuidv4(options);
}

type WorldNodeWithPayload = Prisma.WorldNodeGetPayload<{
  include: {location: true; character: true; narration: true; item: true};
}>;
export const getWorldNodePayload = (node: WorldNodeWithPayload) => {
  const payload =
    node.character ?? node.item ?? node.narration ?? node.location;
  if (!payload) throw new Error(`No payload ${node.id}`);
  return payload;
};
