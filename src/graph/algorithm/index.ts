import { IGraph, IGraphData, IMatrix } from './types/graph.types';
import { createGraphStructure } from './createGraphStructure';
import { calculateYCoordinate } from './calculateYCoordinate';
import { calculateXCoordinate } from './calculateXCoordinate';
import { IAsidePaths, IBalance, IBranches, INodeStyle, IPathMap } from './types/helpers.types';
import { appendFakeNodes } from './appendFakeNodes';
import { balanceGraph } from './balanceGraph';
import { moveFakeNodes } from './moveFakeNodes';
import { appendStyles } from './appendStyles';
import { shrinkFakeNodes } from './shrinkFakeNodes';
import { moveToLeft } from './moveToLeft';

export class LayeredGraph {

  public graph: IGraph = {};
  public startNode: string | undefined;
  public endNode: string | undefined;

  public matrix: IMatrix = [];
  public median: number = 0;
  public pathMap: IPathMap = {};
  public branches: IBranches = {};

  public styles: INodeStyle = {
    width: 80,
    height: 30,
    gap: {
      horizontal: 50,
      vertical: 50
    },
    fakeWidth: 5
  }

  constructor(public data: IGraphData) {
  }

  init(): IGraph {
    console.time();
    /** [1] Create Graph structure */
    this.graph = createGraphStructure(this.data);

    /** [2] Detect start and end nodes */
    this.startNode = this.data.path[0];
    this.endNode = this.data.path[this.data.path.length - 1];

    /** [3] Calculate Y coordinate */
    this.matrix = calculateYCoordinate(this.data, this.graph, this.endNode);

    /** [4] Calculate X coordinate */
    this.matrix = calculateXCoordinate(this.graph, this.matrix, this.endNode);

    /** [5] Append Fake nodes to the algorithm */
    this.pathMap = appendFakeNodes(this.data.edges, this.graph, this.matrix, this.data.path);

    /** [6] Balance algorithm */
    const balance: IBalance = balanceGraph(this.data.path, this.graph, this.matrix);
    this.median = balance.median;
    this.matrix = balance.matrix;
    this.branches = balance.branches;

    /** [7] Move fake nodes until there are no gaps */
    const asidePaths: IAsidePaths = moveFakeNodes(this.graph, balance, this.pathMap);
    this.median = asidePaths.median;

    // End of the main algorithm. Next functions change visualization properties.

    /** [8] Append styles to the nodes */
    appendStyles(this.graph, this.styles);

    /** [9] Shrink fake nodes */
    shrinkFakeNodes(asidePaths.paths, this.graph, this.median, this.matrix, this.styles);

    /** [10] Move to left while there is empty spot */
    moveToLeft(this.graph);

    console.timeEnd();

    console.log(this.graph)
    console.log(this.matrix)
    return this.graph;
  }
}
