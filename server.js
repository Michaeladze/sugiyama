const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());

app.get('/graph/:id', (req, res) => {

  fs.readFile(`./database/data${req.params.id}.json`, 'utf-8', (err, data) => {
    if (err) throw err;
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
    res.json({nodes, edges, path: [s, ...path, e]});
  });


})

app.listen(4200);
