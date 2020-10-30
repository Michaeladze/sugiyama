import { IGraph } from './types/graph.types';
import { INodeStyle } from './types/helpers.types';

export function appendStyles(graph: IGraph, styles: INodeStyle) {
  const keys: string[] = Object.keys(graph);

  keys.forEach((node: string) => {
    graph[node].style = {
      width: graph[node].style.width || styles.width,
      height: graph[node].style.height || styles.height,
      translate: {
        x: graph[node].style.translate?.x || graph[node].x * (styles.width + styles.gap.horizontal),
        y: graph[node].style.translate?.y || graph[node].y * (styles.height + styles.gap.vertical)
      }
    };
  });
}
