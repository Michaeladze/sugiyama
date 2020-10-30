import { IGraphData } from '../types/graph.types';

export const mock1: IGraphData = {
  nodes: ['Start', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'End'],
  edges: [
    { from: 'Start', to: 'A' },
    { from: 'A', to: 'B' },
    { from: 'A', to: 'I' },
    { from: 'B', to: 'C' },
    { from: 'B', to: 'D' },
    { from: 'B', to: 'G' },
    { from: 'C', to: 'E' },
    { from: 'C', to: 'F' },
    { from: 'C', to: 'H' },
    { from: 'D', to: 'E' },
    { from: 'D', to: 'G' },
    { from: 'E', to: 'F' },
    { from: 'F', to: 'End' },
    { from: 'H', to: 'F' }
  ],
  path: ['Start', 'A', 'B', 'C', 'F', 'End']
}
