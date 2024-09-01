import {type WorldNodeType} from '@prisma/client';
import Ajv, {type AnySchema} from 'ajv';
import axios from 'axios';
import {type Edge} from 'reactflow';
import seedrandom from 'seedrandom';
import superjson from 'superjson';
import {v4 as uuidv4, type V4Options} from 'uuid';

import {type GraphvizJson} from '@/interfaces/IGraphViz';
import {type WorldNodeWithOptionalPayload} from '@/server/api/interfaces/IWorldApi';
import {toast} from '@hooks/useToast';
import {type EditAttributesSchema} from '@schemas/worldInputApiSchemas';

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

export const getWorldNodePayload = (node: WorldNodeWithOptionalPayload) => {
  const payload = node.WorldContent;
  if (!payload) throw new Error(`No payload ${node.id} ${node.type}`);
  return payload;
};

export const convertToDot = (
  nodes: {id: string; data: object}[],
  edges: Edge[],
): string => {
  let dotString = 'digraph G {\n';

  dotString +=
    '  node [shape="rect", width=2.2, height=1.4, fixedsize=true];\n';

  nodes.forEach(node => {
    const nodeData = JSON.stringify(node.data).replace(/"/g, '\\"'); // Użycie JSON.stringify i escape

    dotString += `  "${node.id}"  [data="${nodeData}"];\n`;
  });

  edges.forEach(edge => {
    dotString += `  "${edge.source}" -> "${edge.target}";\n`;
  });

  dotString += '}';

  return dotString;
};

export const graphvizToReactFlow = (json: GraphvizJson) => {
  const nodes =
    json.objects?.map(node => {
      const [x, y] = node.pos.split(',').map(Number);
      const width = parseFloat(node.width) * 72;
      const height = parseFloat(node.height) * 72;
      return {
        id: node.name,
        type: 'customNode',
        data: JSON.parse(node.data) as {
          Name: string;
          Id: string;
          Type: WorldNodeType;
        },
        position: {x: x! - width / 2, y: y! - height / 2},
      };
    }) || [];

  const edges =
    json.edges?.map(edge => ({
      id: `e${edge.tail}-${edge.head}`,
      source: json.objects[edge.tail]!.name,
      target: json.objects[edge.head]!.name,
    })) || [];

  return {nodes, edges};
};

export const copyJsonToClipboard = (jsonData: object) => {
  const jsonString = JSON.stringify(jsonData, null, 2);
  navigator.clipboard
    .writeText(jsonString)
    .then(() => {
      toast({
        title: 'Skopiowano',
      });
    })
    .catch(err => {
      console.error('Błąd przy kopiowaniu JSON-a do schowka:', err);
    });
};

export const downloadJsonToFile = (
  jsonData: object,
  filename = 'data.json',
) => {
  const jsonString = JSON.stringify(jsonData, null, 2);
  const blob = new Blob([jsonString], {type: 'application/json'});
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const validateJSONSchema = async (schemaUrl: string, data: object) => {
  try {
    const response = await axios.get(schemaUrl);
    const schema = response.data as AnySchema;

    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(data);

    return {
      valid,
      errors: validate.errors,
    };
  } catch (err) {
    return {
      valid: false,
      errors: err instanceof Error ? err.message : 'Unknown error',
    };
  }
};
