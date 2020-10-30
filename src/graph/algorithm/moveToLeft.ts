import { IGraph } from './types/graph.types';

export function moveToLeft(graph: IGraph) {
  let minX: number = Number.MAX_SAFE_INTEGER;

  const keys: string[] = Object.keys(graph);

  keys.forEach((node: string) => {
    minX = Math.min(minX, graph[node].style.translate.x);
  });

  keys.forEach((node: string) => {
    graph[node].style.translate.x -= minX;
  });
}
