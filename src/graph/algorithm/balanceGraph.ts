import { IGraph, IMatrix, IMatrixCell } from './types/graph.types';
import { IBalance, IBranchEntry, IBranches, IGraphBalance, IMap, IMedianAlignment } from './types/helpers.types';
import { fillMatrixGaps } from './fillMatrixGaps';

export function balanceGraph(process: string[], graph: IGraph, matrix: IMatrix): IBalance {
  const atm: IMedianAlignment = alignToMedian(graph, matrix);
  const branches: IBranches = searchBranches(graph);

  const branchEntries: IBranchEntry[] = Object.entries(branches);
  const averageXMap: IMap<number> = {};
  const shiftedBranches: IBranches = {};

  balancing(graph, atm, branchEntries, averageXMap, shiftedBranches);
  atm.matrix = fillMatrixGaps(atm.matrix, graph, atm.median);

  return { ...atm, branches };
}

/** The median of the algorithm is its process */
function alignToMedian(graph: IGraph, matrix: IMatrix): IMedianAlignment {
  let median: number = 0;
  matrix.forEach((row: IMatrixCell[]) => {
    median = Math.max(row.length, median);
  });

  const newMatrix: IMatrix = [];
  for (const node in graph) {
    if (graph.hasOwnProperty(node)) {
      graph[node].x = graph[node].x + median;

      if (!newMatrix[graph[node].y]) {
        newMatrix[graph[node].y] = [];
      }
      newMatrix[graph[node].y][graph[node].x] = node;
    }
  }

  const balance: IGraphBalance = checkBalance(newMatrix, median, graph);

  return { balance, matrix: newMatrix, median };
}

/** Define the weight of each side of the algorithm and return ratio  */
function checkBalance(matrix: IMatrix, median: number, graph: IGraph): IGraphBalance {
  let leftNodesCount: number = 0;
  let rightNodesCount: number = 0;

  let leftRealNodesCount: number = 0;
  let rightRealNodesCount: number = 0;

  for (let i: number = 0; i < matrix.length; i++) {
    for (let j: number = 0; j < matrix[i].length; j++) {
      if (j === median) {
        continue;
      }

      const node: IMatrixCell = matrix[i][j];

      if (node) {
        if (matrix[i][j] && j < median) {
          leftNodesCount++;
          if (!graph[node].isFake) {
            leftRealNodesCount++;
          }
        }
        if (matrix[i][j] && j > median) {
          rightNodesCount++;
          if (!graph[node].isFake) {
            rightRealNodesCount++;
          }
        }
      }
    }
  }

  const ratio: number = Math.floor((rightNodesCount - leftNodesCount) / 2);
  const realRatio: number = Math.floor((rightRealNodesCount - leftRealNodesCount) / 2);

  return { ratio, realRatio, rightNodesCount, leftNodesCount, rightRealNodesCount, leftRealNodesCount };
}

function searchBranches(graph: IGraph): IBranches {
  const branches: IBranches = {};

  const visitedNodes: IMap<boolean> = {};

  const bft = (node: string): string[] => {
    const branch: string[] = [];
    const nodesStack: string[] = [node];

    while (nodesStack.length) {
      const currentNode = nodesStack.pop() as string;

      if (!visitedNodes[currentNode]) {
        visitedNodes[currentNode] = true;
      }

      branch.push(currentNode);

      [...graph[currentNode].children, ...graph[currentNode].parents].forEach((relativeNode: string) => {
        if (!visitedNodes[relativeNode] && !graph[relativeNode].isProcess) {
          nodesStack.push(relativeNode);
        }
      });
    }

    return branch;
  };

  for (const node in graph) {
    if (graph.hasOwnProperty(node) && graph[node].processSibling === 1 && !graph[node].isFake && !visitedNodes[node]) {
      branches[node] = bft(node);
    }
  }

  return branches;
}


function balancing(graph: IGraph, atm: IMedianAlignment, branchEntries: IBranchEntry[], averageXMap: IMap<number>, shiftedBranches: IBranches) {
  let branchToShift: IBranchEntry;

  let approximations: number[][] = approximate(branchEntries, graph, atm, averageXMap);

  while (approximations.length > 0 && atm.balance.ratio > 0 && branchEntries.length > 1) {
    const indexOfBranch: number = approximations[0][approximations[0].length - 1];
    branchToShift = branchEntries[indexOfBranch];

    if (!shiftedBranches[branchToShift[0]]) {
      shiftToLeft(graph, branchToShift, atm, shiftedBranches);
      branchEntries = branchEntries.filter((b: IBranchEntry) => !shiftedBranches[b[0]]);
      approximations = approximate(branchEntries, graph, atm, averageXMap);
    }
  }
}

function calcBranchAverageX(branch: IBranchEntry, graph: IGraph, averageXMap: IMap<number>) {
  let avgX: number = 0;

  branch[1].forEach((n: string) => {
    avgX += graph[n].x;
  });

  averageXMap[branch[0]] = Math.round(avgX / branch[1].length);
  return averageXMap[branch[0]];
}


function shiftToLeft(graph: IGraph, branch: IBranchEntry, atm: IMedianAlignment, shiftedBranches: IBranches) {
  shiftedBranches[branch[0]] = branch[1];

  let nodesCount: number = 0;
  let realNodesCount: number = 0;

  /** Invert X coordinate */
  branch[1].forEach((node: string) => {
    nodesCount++;

    if (!graph[node].isFake) {
      realNodesCount++;
    }

    atm.matrix[graph[node].y][graph[node].x] = undefined;
    graph[node].x = atm.median - (graph[node].x - atm.median);
    atm.matrix[graph[node].y][graph[node].x] = node;
  });

  atm.balance.ratio -= nodesCount;
  atm.balance.realRatio -= realNodesCount;
  atm.balance.leftNodesCount += nodesCount;
  atm.balance.leftRealNodesCount += realNodesCount;
  atm.balance.rightNodesCount -= nodesCount;
  atm.balance.rightRealNodesCount -= realNodesCount;
}

/** Array of the proximity of the path length to the number of nodes that need to be thrown to the left side (ratio).
 * Sorting first by realRatio, then by the X coordinate, so that the algorithm is balanced vertically,
 * then by closeness to ratio */
function approximate(branchEntries: IBranchEntry[], graph: IGraph, atm: IMedianAlignment, averageXMap: IMap<number>): number[][] {
  return branchEntries
    .map((branch: IBranchEntry, indexOfBranch: number) => {
      const delta: number = Math.abs(branch[1].length - atm.balance.ratio);
      const realNodes: string[] = branch[1].filter((node: string) => !graph[node].isFake);
      const realDelta: number = Math.abs(realNodes.length - atm.balance.realRatio);
      const averageX: number = averageXMap[branch[0]] || calcBranchAverageX(branch, graph, averageXMap);
      return [delta, realDelta, averageX, indexOfBranch];
    })
    .sort((a1: number[], a2: number[]) => a1[1] - a2[1] || a1[0] - a2[0] || a2[2] - a1[2]);
}
