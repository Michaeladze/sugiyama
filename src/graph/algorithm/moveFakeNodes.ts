import { IGraph, IMatrix } from './types/graph.types';
import { IAsidePaths, IBalance, IPathEntry, IPathMap } from './types/helpers.types';

export function moveFakeNodes(graph: IGraph, balance: IBalance, pathMap: IPathMap): IAsidePaths {
  const matrix: IMatrix = balance.matrix;

  const leftPaths: IPathMap = {};
  const rightPaths: IPathMap = {};

  Object.keys(pathMap).forEach((key: string) => {
    const array: string[] = Array.from(pathMap[key]);

    const anyNode: string = array[0];
    if (graph[anyNode].x > balance.median) {
      rightPaths[key] = pathMap[key];
    }

    if (graph[anyNode].x < balance.median) {
      leftPaths[key] = pathMap[key];
    }
  });

  const leftEntries: IPathEntry[] = Object.entries(leftPaths);
  const rightEntries: IPathEntry[] = Object.entries(rightPaths);

  const shift = (x: number, path: string[]) => {
    let valid: boolean = true;
    for (let i: number = 0; i < path.length; i++) {
      if (!graph[path[i]].isFake) {
        continue;
      }

      const y: number = graph[path[i]].y;
      valid = matrix[y][x] === undefined || (matrix[y][x] !== undefined && path.indexOf(matrix[y][x] as string) >= 0);

      if (!valid) {
        break;
      }
    }

    if (valid) {
      for (let i: number = 0; i < path.length; i++) {
        if (graph[path[i]].isFake) {
          matrix[graph[path[i]].y][graph[path[i]].x] = undefined;
          matrix[graph[path[i]].y][x] = path[i];
          graph[path[i]].x = x;
        }
      }
    }
  };

  leftEntries.forEach((e: IPathEntry) => {
    const path: string[] = Array.from(e[1]);
    let x: number = Number.MAX_SAFE_INTEGER;

    path.forEach((n: string) => {
      x = Math.min(graph[n].x, x);
    });

    for (x; x < balance.median; x++) {
      shift(x, path);
    }
  });

  rightEntries.forEach((e: IPathEntry) => {
    const path: string[] = Array.from(e[1]);
    let x: number = Number.MIN_SAFE_INTEGER;

    path.forEach((n: string) => {
      x = Math.max(graph[n].x, x);
    });

    for (x; x > balance.median; x--) {
      shift(x, path);
    }
  });

  const keys: string[] = Object.keys(graph);

  let min: number = Number.MAX_SAFE_INTEGER;
  keys.forEach((n: string) => {
    min = Math.min(min, graph[n].x);
  });

  keys.forEach((n: string) => {
    graph[n].x -= min;
  });

  return {
    median: balance.median - min,
    paths: [leftEntries, rightEntries]
  }
}
