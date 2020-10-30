import { IGraph, IMatrix } from './types/graph.types';

export function fillMatrixGaps(matrix: IMatrix, graph: IGraph, median: number = 0): IMatrix {
  function shiftCells(undefinedQueue: number[], i: number, j: number, matrix: IMatrix) {
    if (matrix[i][j] === undefined) {
      /** Запоминаем пустую ячейку */
      undefinedQueue.push(j);
    } else {
      if (!graph[matrix[i][j] as string].isFake) {
        const c: number | undefined = undefinedQueue.shift();
        if (c) {
          /** Вставляем узел в первую доступную пустую ячейку */
          graph[matrix[i][j] as string].x = c;
          matrix[i][c] = matrix[i][j];
          matrix[i][j] = undefined;
          undefinedQueue.push(j);
        }
      }
    }
  }

  for (let i: number = 0; i < matrix.length; i++) {
    let undefinedQueue: number[] = [];

    /** Right side */
    for (let j: number = median; j < matrix[i].length; j++) {
      shiftCells(undefinedQueue, i, j, matrix);
    }

    undefinedQueue = [];

    /** Left side */
    for (let j: number = median - 1; j >= 0; j--) {
      shiftCells(undefinedQueue, i, j, matrix);
    }
  }

  return matrix;
}
