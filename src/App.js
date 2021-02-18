import React from 'react';
import logo from './logo.svg';
import Cell from './components/cell.js';
import './App.css';

const gridSize = 100;

function App() {
  return (
    <div className="App">
      <Cell kissme="nothanks"/>
    </div>
  );
}

export default App;
