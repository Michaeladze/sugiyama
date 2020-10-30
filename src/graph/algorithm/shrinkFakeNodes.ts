import { INodeStyle, IPathEntry } from './types/helpers.types';
import { IGraph, IMatrix, IMatrixCell } from './types/graph.types';

export function shrinkFakeNodes(paths: IPathEntry[][], graph: IGraph, median: number, matrix: IMatrix, styles: INodeStyle) {
  let min: number = Number.MAX_SAFE_INTEGER;
  let max: number = Number.MIN_SAFE_INTEGER;

  matrix.forEach((row: IMatrixCell[]) => {
    row.forEach((node: IMatrixCell) => {
      if (node !== undefined && !graph[node].isFake) {
        min = Math.min(min, graph[node].x);
        max = Math.max(max, graph[node].x);
      }
    });
  });

  const left: string[][] = paths[0]
    .map((e: IPathEntry) => Array.from(e[1]).filter((n: string) => graph[n].isFake && graph[n].x < min))
    .filter((e: string[]) => e.length)
    .sort((a: string[], b: string[]) => graph[b[0]].x - graph[a[0]].x);

  let x: number = min;

  left.forEach((nodes: string[]) => {
    nodes.forEach((n: string) => {
      if (graph[n].x !== x) {
        x = graph[n].x;
      }

      graph[n].style.width = styles.fakeWidth;
      graph[n].style.translate.x += (styles.width - styles.fakeWidth) * (min - x);
    });
  });

  /** Правая сторона */
  const right: string[][] = paths[1]
    .map((e: IPathEntry) => Array.from(e[1]).filter((n: string) => graph[n].isFake && graph[n].x > max))
    .filter((e: string[]) => e.length)
    .sort((a: string[], b: string[]) => graph[a[0]].x - graph[b[0]].x);

  x = max;

  right.forEach((nodes: string[]) => {
    nodes.forEach((n: string) => {
      if (graph[n].x !== x) {
        x = graph[n].x;
      }

      graph[n].style.width = styles.fakeWidth;

      if (x > max) {
        graph[n].style.translate.x -= (styles.width - styles.fakeWidth) * (x - max - 1);
      }
    });
  });
}
