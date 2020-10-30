import { IGraph, IMatrix } from './algorithm/types/graph.types';

export function rearrangeMatrix(graph: IGraph): IMatrix {
  const matrix: IMatrix = [];

  for (const node in graph) {
    if (matrix[graph[node].y] === undefined) {
      matrix[graph[node].y] = [];
    }

    matrix[graph[node].y][graph[node].x] = node;
  }

  return matrix;
}
