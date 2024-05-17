import superjson from 'superjson';

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
