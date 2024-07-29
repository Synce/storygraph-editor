import {type Node, type Edge} from 'reactflow';
import seedrandom from 'seedrandom';
import superjson from 'superjson';
import {v4 as uuidv4, type V4Options} from 'uuid';

import {type GraphvizJson} from '@/interfaces/IGraphViz';
import {type WorldNodeWithOptionalPayload} from '@/server/api/interfaces/IWorldApi';
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
  if (!payload) throw new Error(`No payload ${node.id}`);
  return payload;
};

export const convertToDot = (nodes: Node[], edges: Edge[]): string => {
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
  const nodes = json.objects.map(node => {
    const [x, y] = node.pos.split(',').map(Number);
    const width = parseFloat(node.width) * 72;
    const height = parseFloat(node.height) * 72;
    return {
      id: node.name,
      type: 'worldNode',
      data: JSON.parse(node.data),
      position: {x: x! - width / 2, y: y! - height / 2},
    };
  });

  const edges = json.edges.map(edge => ({
    id: `e${edge.tail}-${edge.head}`,
    source: json.objects[edge.tail]!.name,
    target: json.objects[edge.head]!.name,
  }));

  return {nodes, edges};
};
