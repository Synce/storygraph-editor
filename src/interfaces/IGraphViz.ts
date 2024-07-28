type Point = [number, number];

interface DrawCommand {
  op: string;
  points?: Point[];
  text?: string;
}

interface Node {
  _gvid: number;
  name: string;
  _draw_?: DrawCommand[];
  _ldraw_?: DrawCommand[];
  label: string;
  pos: string;
  width: string;
  height: string;
}

interface Edge {
  _gvid: number;
  tail: number;
  head: number;
  pos: string;
}

export interface GraphvizJson {
  name: string;
  directed: boolean;
  strict: boolean;
  objects: Node[];
  edges: Edge[];
}
