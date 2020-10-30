import { IEdge } from '../types/graph.types';

export function distinctArray<T>(array: T[]): T[] {
  const map = new Map();
  const newArray: T[] = [];

  array.forEach((element: T) => {
    if (!map.has(element)) {
      newArray.push(element);
      map.set(element, true);
    }
  });

  return newArray;
}

export function getPathName(edge: IEdge, reverse: boolean = false): string {
  return reverse ? `${edge.to}->${edge.from}` : `${edge.from}->${edge.to}`;
}
