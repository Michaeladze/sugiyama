import { IEdge, IGraph, IMatrix, INode } from './types/graph.types';
import { getPathName } from './helpers/helpers';
import { IPathMap } from './types/helpers.types';
import { GraphNode } from './createGraphStructure';

export const appendFakeNodes = (edges: IEdge[], graph: IGraph, matrix: IMatrix, process: string[]): IPathMap => {
  let indexesToRemove: Set<number> = new Set();
  const pathMap: IPathMap = {};

  edges
    .sort((edge1: IEdge, edge2: IEdge) => {
      const length1: number = Math.abs(graph[edge1.from].y - graph[edge1.to].y);
      const length2: number = Math.abs(graph[edge2.from].y - graph[edge2.to].y);
      return length1 - length2;
    })
    .forEach((edge: IEdge, i: number) => {
      let length: number = graph[edge.from].y - graph[edge.to].y;
      if (Math.abs(length) > 1) {
        const pathName: string = getPathName(edge);

        if (!pathMap[pathName]) {
          pathMap[pathName] = new Set<string>();
        }

        /** Find empty column and place new fake nodes to it */
        indexesToRemove.add(i);

        if (graph[edge.from].isProcess === 0) pathMap[pathName].add(edge.from);
        if (graph[edge.to].isProcess === 0) pathMap[pathName].add(edge.to);

        const isProcess: boolean = process
          .map((node: string, i: number) => `${ node }=>${ process[i + 1] }`)
          .includes(`${ edge.from }=>${ edge.to }`);

        const emptyX: number = findEmptyX(edge.from, edge.to, graph, matrix);

        const node1: INode = graph[edge.from];
        const node2: INode = graph[edge.to];
        const c: boolean = node1.y > node2.y;
        const d: number = c ? -1 : 1;
        let y: number = node1.y + d;

        let newFromNode: string = edge.from;
        let fakeNodesCount: number = 1;

        for (y; c ? y > node2.y : y < node2.y; c ? y-- : y++) {
          // if (y !== node1.y + d && y !== node2.y - d) {
          //   continue;
          // }

          const name: string = fakeNodeName(edge.from, edge.to, fakeNodesCount);
          pathMap[pathName].add(name);
          fakeNodesCount++;

          /** Append Node */

          graph[name] = new GraphNode(name);
          graph[name].children = [edge.to];
          graph[name].x = emptyX;
          graph[name].y = y;
          graph[name].parents = [newFromNode];
          graph[name].isProcess = isProcess ? 1 : 0;
          graph[name].processSibling = isProcess ? 0 : graph[newFromNode].processSibling + 1;
          graph[name].isFake = 1;
          graph[name].style = {};

          if (isProcess) {
            appendToProcess(edge.to, name, process);
          }

          graph[newFromNode].children = graph[newFromNode].children.filter((node: string) => node !== edge.to);
          graph[newFromNode].children.push(name);
          graph[edge.to].parents = graph[edge.to].parents.filter((node: string) => node !== edge.from);
          graph[edge.to].parents.push(name);

          if (edges[edges.length - 1].from.includes(`${edge.from}${edge.to}`)) {
            indexesToRemove.add(edges.length - 1);
          }

          edges.push({
            from: newFromNode,
            to: name
          });
          edges.push({
            from: name,
            to: edge.to
          });

          newFromNode = name;
          matrix[y][emptyX] = name;
        }
      }
    });


  const indexes: number[] = Array.from(indexesToRemove).sort((p: number, q: number) => p - q);

  for (let i: number = indexes.length - 1; i >= 0; i--) {
    edges.splice(indexes[i], 1);
  }

  return pathMap;
};

function fakeNodeName(from: string, to: string, fakeNodesCount: number): string {
  return `${ from }${ to }${ fakeNodesCount }`;
}

function appendToProcess(to: string, node: string, process: string[]) {
  const index: number = process.indexOf(to);
  if (index >= 0) {
    process.splice(index, 0, node);
  }
}

function findEmptyX(from: string, to: string, graph: IGraph, matrix: IMatrix): number {
  const node1: INode = graph[from];
  const node2: INode = graph[to];

  const c: boolean = node1.y > node2.y;

  let y: number = c ? node1.y - 1 : node1.y + 1;
  let x: number = Math.max(node1.x, node2.x);

  while (true) {
    let columnIsEmpty: boolean = true;
    for (y; c ? y > node2.y : y < node2.y; c ? y-- : y++) {
      if (matrix[y][x] !== undefined) {
        columnIsEmpty = false;
        break;
      }
    }

    if (columnIsEmpty) {
      break;
    }

    x++;
  }

  return x;
}
