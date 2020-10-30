import { IEdge, IGraph, IGraphData, INode } from './types/graph.types';
import { NumberBoolean } from './types/helpers.types';

/**
 * Constructor for Nodes
 */
export class GraphNode implements INode {
  public children: string[] = [];
  public x: number = 0;
  public y: number = 0;
  public parents: string[] = [];
  public isProcess: NumberBoolean = 0;
  public isFake: NumberBoolean = 0;
  public processSibling: number = 0;
  public style: any = {};

  constructor(public id: string) {
  }
}

/**
 * @param data - algorithm data from which to generate a algorithm structure
 */
export function createGraphStructure(data: IGraphData): IGraph {
  const graph: IGraph = {};

  data.edges.forEach((e: IEdge) => {
    if (graph[e.from] === undefined) {
      graph[e.from] = new GraphNode(e.from);
    }

    if (graph[e.to] === undefined) {
      graph[e.to] = new GraphNode(e.to);
    }

    graph[e.to].parents.push(e.from);
    graph[e.from].children.push(e.to);
  });

  return graph;
}
