const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());

const data = fs.readFileSync('./database/data1.json', 'utf-8');

app.get('/graph', (req, res) => {
  const d = JSON.parse(data);
  let s = '[START]', e = '[END]';
  const nodes = d.nodes.map(e => {
    return e.name;
  });
  const edges = d.edges.map(e => ({
    from: d.nodes[e.from].name,
    to: d.nodes[e.to].name,
  }));
  const path = d.paths[0].path.map(n => d.nodes[n].name);
  res.json({ nodes, edges, path: [s, ...path, e] });
})

app.listen(4200);
