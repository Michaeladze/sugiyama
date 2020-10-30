import { IMatrix, INode } from './graph.types';

/** General Map */
export interface IMap<T> {
  [k: string]: T;
}

/** Boolean represented as number for convenient sorting */
export type NumberBoolean = 1 | 0;

/** Entry of the object Object.entries(<IGraph>) */
export type INodeEntry = [string, INode];

/** The Map of the paths represented as Sets */
export type IPathMap = IMap<Set<string>>;

/** Entry of the object Object.entries(<IPathMap>) */
export type IPathEntry = [string, Set<string>];

/** Balance of the algorithm */
export interface IGraphBalance {
  ratio: number;
  realRatio: number;
  rightNodesCount: number;
  leftNodesCount: number;
  rightRealNodesCount: number;
  leftRealNodesCount: number;
}

/** Branches */
export type IBranches = IMap<string[]>;

/** Entry of the object Object.entries(<IBranches>) */
export type IBranchEntry = [string, string[]];

export interface IMedianAlignment {
  balance: IGraphBalance;
  matrix: IMatrix;
  median: number;
}

export interface IBalance extends IMedianAlignment {
  branches: IBranches;
}

/** Result of moving fake nodes to empty columns */
export interface IAsidePaths {
  median: number;
  paths: IPathEntry[][]
}

/** Styles of the node */
export interface INodeStyle {
  width: number;
  height: number;
  gap: {
    horizontal: number;
    vertical: number;
  };
  fakeWidth: number;
}
