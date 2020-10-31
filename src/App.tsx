import React from 'react';
import './App.css';
import Graph from './graph/components/Graph';
import { NavLink, Route } from 'react-router-dom';

function App() {

  const array = [1,2,3,4,5,6,7,8,9].map((d: number) => {
    return <NavLink className='link' activeClassName='active' key={d} to={`/graph/${d}`}>Dataset {d}</NavLink>
  })

  return (
    <div className="app">
      <nav className='nav'>
        {array}
      </nav>
      <Route path={'/graph/:id'} component={Graph}/>
    </div>
  );
}

export default App;
