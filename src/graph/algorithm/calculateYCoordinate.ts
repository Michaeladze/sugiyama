import { IGraph, IGraphData, IMatrix } from './types/graph.types';
import { distinctArray } from './helpers/helpers';
import { IMap, INodeEntry } from './types/helpers.types';

export function calculateYCoordinate(data: IGraphData, graph: IGraph, endNode: string): IMatrix {
  const processGraph: IGraph = setCoordinateForProcess(data.path, graph);
  arrangeNodesByYAxis(processGraph, graph, data, endNode);
  return normalizeYCoordinate(graph, endNode);
}

/**
 * Create processGraph to calculate connectedness to the process
 * @param process
 * @param graph
 */
function setCoordinateForProcess(process: string[], graph: IGraph): IGraph {
  const processGraph: IGraph = {};
  const distinctProcess: string[] = distinctArray<string>(process);

  distinctProcess.forEach((node: string, yCoordinate: number) => {
    graph[node].y = yCoordinate + 1;
    graph[node].isProcess = 1;
    processGraph[node] = graph[node];
  });
  return processGraph;
}

/**
 * Calculate connectedness to the process
 * @param processGraph
 * @param graph
 * @param data
 * @param endNode
 */
function calcConnectedness(processGraph: IGraph, graph: IGraph, data: IGraphData, endNode: string) {
  const visited: IMap<IMap<boolean>> = {};

  const dft = (node: string, parent: string | null = null) => {
    if (!visited[node]) {
      visited[node] = {};
    }

    if (parent !== null) {
      visited[node][parent] = true;

      if (processGraph[node] && !processGraph[parent] && node !== endNode) {
        graph[parent].processSibling = 1;
      }

      if (!processGraph[node] && processGraph[parent]) {
        graph[node].processSibling = 1;
      }

      if (!processGraph[node] && !processGraph[parent]) {
        graph[node].processSibling = graph[parent].processSibling + 1;
      }
    }

    graph[node].children.forEach((childNode: string) => {
      if (!visited[childNode]) {
        visited[childNode] = {};
      }

      if (!graph[childNode].processSibling && !visited[childNode][node]) {
        dft(childNode, node);
      }
    });
  };

  data.nodes.forEach((node: string) => {
    dft(node);
  });
}

/**
 * Arrange Y coordinate according to the connectedness
 * @param process
 * @param graph
 * @param data
 * @param endNode
 */
function arrangeNodesByYAxis(process: IGraph, graph: IGraph, data: IGraphData, endNode: string) {
  calcConnectedness(process, graph, data, endNode);

  /** Sort by connectedness to the process */
  const entries: INodeEntry[] = Object.entries(graph)
    .filter((a: INodeEntry) => !graph[a[0]].isProcess)
    .sort((a: INodeEntry, b: INodeEntry) => a[1].processSibling - b[1].processSibling);

  entries.forEach((e: INodeEntry) => {
    let accRank = 0;
    let relativesCount: number = 0;

    [...e[1].children, ...e[1].parents].forEach((node: string) => {
      if (node !== endNode && node !== e[0]) {
        accRank += graph[node].y;
        if (graph[node].isProcess || graph[node].y) {
          relativesCount++
        }
      }
    });

    const y: number = Math.ceil(accRank / relativesCount) + 1;
    e[1].y = isNaN(y) ? 0 : y;
  });
}

/**
 * Normalize Y coordinate (remove gaps)
 * @param graph
 * @param endNode
 */
function normalizeYCoordinate(graph: IGraph, endNode: string): IMatrix {
  const matrix: IMatrix = [];

  /** Sorting */
  const entries: INodeEntry[] = Object.entries(graph).sort(
    (a: INodeEntry, b: INodeEntry) =>
      b[1].isProcess - a[1].isProcess || a[1].y - b[1].y || a[1].processSibling - b[1].processSibling
  );

  /** Place last element to the last Y of the matrix */
  const endIndex: number = entries.findIndex((e: INodeEntry) => e[0] === endNode);
  entries.push(entries[endIndex]);
  entries.splice(endIndex, 1);

  /** Normalization */
  const map = new Map();

  entries.forEach((nodeEntry: INodeEntry) => {
    const currentY: number = nodeEntry[1].y;
    let size: number = map.size;

    if (!map.has(currentY)) {
      map.set(currentY, size)
    } else {
      size = map.get(currentY)
    }

    if (!matrix[size]) {
      matrix[size] = []
    }

    if (!nodeEntry[1].isProcess && matrix[size].length === 0) {
      matrix[size].push(undefined)
    }

    matrix[size].push(nodeEntry[0]);
    graph[nodeEntry[0]].y = map.get(currentY);
  });

  return matrix;
}
