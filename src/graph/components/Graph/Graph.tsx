import React, { useEffect, useRef } from 'react';
import './Graph.css';
import { mock1 } from '../../algorithm/mocks/mock-1';
import { LayeredGraph } from '../../algorithm';
import { IEdge, INode } from '../../algorithm/types/graph.types';

interface IProps {

}

const Graph: React.FC<IProps> = () => {

  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {

    fetch('http://localhost:4200/graph').then(res => res.json())
      .then(data => {
        console.log(data)
        const graph: LayeredGraph = new LayeredGraph(data);
        graph.init();

        if (canvas.current) {
          canvas.current.width = 5000; // window.innerWidth;
          canvas.current.height = 5000; // window.innerHeight;

          const ctx = canvas.current.getContext('2d');
          const nodes: INode[] = Object.values(graph.graph);

          if (ctx) {
            graph.data.edges.forEach((e: IEdge) => {
              ctx.beginPath();
              const fromX = graph.graph[e.from].style.translate.x + graph.graph[e.from].style.width / 2;
              const fromY = graph.graph[e.from].style.translate.y + graph.graph[e.from].style.height / 2;
              const toX = graph.graph[e.to].style.translate.x + graph.graph[e.to].style.width / 2;
              const toY = graph.graph[e.to].style.translate.y + graph.graph[e.to].style.height / 2;

              ctx.moveTo(fromX, fromY);
              ctx.lineTo(toX, toY);
              ctx.stroke();
            });

            nodes.forEach((node: INode) => {
              if (!node.isFake) {
                const x = node.style.translate.x + node.style.width / 2;
                const y = node.style.translate.y + node.style.height / 2;

                ctx.fillRect(node.style.translate.x, node.style.translate.y, node.style.width, node.style.height);
                ctx.fillStyle = '#ffffff';
                ctx.strokeRect(node.style.translate.x, node.style.translate.y, node.style.width, node.style.height);
                ctx.strokeStyle = '#000000';
                ctx.strokeText(node.id, x, y);
                ctx.textAlign = 'center';
              }
            });
          }
        }
      })
  }, [])

  return (
    <div className='stage'>
      <canvas id="canvas" ref={ canvas }/>
    </div>
  );
};

export default Graph;
