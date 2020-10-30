import { NumberBoolean } from './helpers.types';

/** The input algorithm interface */
export interface IGraphData {
  nodes: string[];
  edges: IEdge[];
  path: string[];
}

/** Edge of the algorithm. Has two pointers from -> to */
export interface IEdge {
  from: string;
  to: string;
}

/** Node of the algorithm. Represented as unique ID */
export interface INode {
  id: string;
  children: string[];
  parents: string[];
  x: number;
  y: number;
  isProcess: NumberBoolean;
  processSibling: number;
  isFake: NumberBoolean;
  style: any;
}

/** The algorithm */
export interface IGraph {
  [k: string]: INode;
}

/** Matrix of the algorithm */
export type IMatrix = IMatrixCell[][]

/** Cell of the matrix */
export type IMatrixCell = string | undefined;
