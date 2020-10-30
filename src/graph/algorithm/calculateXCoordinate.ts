import { IGraph, IMatrix, IMatrixCell } from './types/graph.types';
import { IMap, INodeEntry } from './types/helpers.types';
import { fillMatrixGaps } from './fillMatrixGaps';
import { rearrangeMatrix } from '../rearrangeMatrix';

export function calculateXCoordinate(graph: IGraph, matrix: IMatrix, endNode: string): IMatrix {
  for (const node in graph) {
    if (graph.hasOwnProperty(node) && !graph[node].isProcess) {
      const y: number = graph[node].y;
      graph[node].x = matrix[y].indexOf(node);
    }
  }

  if (matrix[matrix.length - 1].length > 1) {
    graph[endNode].y = matrix.length;
    matrix[matrix.length] = [matrix[matrix.length - 1].pop()];
  }

  matrix = findRelativesOnSameY(graph, matrix);
  matrix = normalizeYCoordinate(matrix, graph);
  return fillMatrixGaps(matrix, graph);
}

/**
 * On each level of matrix find parent -> child structures. The child goes down 1 level. If at new level
 * new parent -> child structure appears, then repeat until there are no parent -> child structures.
 * @param graph
 * @param matrix
 */
function findRelativesOnSameY(graph: IGraph, matrix: IMatrix): IMatrix {
  for (let y: number = 0; y < matrix.length; y++) {
    const nodesAtY: IMatrixCell[] = matrix[y];
    const nodesAtYMap: IMap<boolean> = nodesAtY.reduce((map: IMap<boolean>, node: IMatrixCell) => {
      if (node) {
        map[node] = true;
      }
      return map;
    }, {})

    if (nodesAtY) {
      for (let i = 0; i < nodesAtY.length; i++) {
        const node = nodesAtY[i];

        if (node) {
          for (let j = 0; j < graph[node].children.length; j++) {
            const child: string = graph[node].children[j];

            if (nodesAtYMap[child] && node !== child) {
              shiftRanks(y, node, child, graph, matrix);
              matrix = rearrangeMatrix(graph);
            }
          }
        }
      }
    }
  }

  return matrix;
}

function shiftRanks(y: number, parent: string, child: string, graph: IGraph, matrix: IMatrix) {
  if (graph[parent].y !== graph[child].y) {
    return;
  }

  const nodeEntries: INodeEntry[] = Object.entries(graph).sort((a: INodeEntry, b: INodeEntry) => a[1].y - b[1].y);

  const relativeNodes: string[] = [...graph[child].children, ...graph[child].parents];

  const processNodeAtY: INodeEntry | undefined = nodeEntries.find(
    (e: INodeEntry) => {
      return graph[e[0]].y === y + 1 && graph[e[0]].isProcess
    }
  );

  let startShiftingY: number = y;

  if (processNodeAtY && relativeNodes.indexOf(processNodeAtY[0]) >= 0) {
    startShiftingY = y + 1;
  }

  if (startShiftingY > y) {
    nodeEntries.forEach((e: INodeEntry) => {
      if (e[1].y >= startShiftingY) {
        graph[e[0]].y += 1;
      }
    });
  }

  if (!graph[child].isProcess && !graph[parent].isProcess) {
    let x = graph[parent].x;
    if (matrix[graph[parent].y + 1]) {
      while (matrix[graph[parent].y + 1][x] !== undefined) {
        x++;
      }
    }

    // matrix[graph[parent].y].splice(graph[child].x, 1);
    graph[child].x = x;
  }

  graph[child].y = graph[parent].y + 1;
}

function normalizeYCoordinate(matrix: IMatrix, graph: IGraph): IMatrix {
  const newMatrix: IMatrix = [...matrix];
  const map = new Map();

  matrix.forEach((row: IMatrixCell[], y: number) => {
    let size: number = map.size;

    if (!map.has(y)) {
      map.set(y, size)
    } else {
      size = map.get(y)
    }

    if (!matrix[size]) {
      matrix[size] = []
    }

    row.forEach((node: IMatrixCell, x: number) => {
      if (node !== undefined) {
        graph[node].y = map.get(y);
        newMatrix[y][x] = undefined;
        newMatrix[graph[node].y][x] = node;
      }
    });
  });

  return newMatrix
}
