import React, {useState} from 'react';
import Cell from './components/cell.js';
import './App.css';

//Maffah mah'iks

function App() {
  const [gridSize, setGridSize] = useState(10);
  const [cellSize, setCellSize] = useState(50);
  const [selectedTool, setSelectedTool] = useState('start')

  let count = 0;
  

  const matrix = Array.from(Array(gridSize), () => {
    try {
      return new Array(gridSize).fill(<Cell onClick={selectedTool} bigness={cellSize}/>);
    } finally {
      console.log(count);
      count++;
    };
  });
  // const matrixData = matrix.map((row, rowIndex) => {
  //   return row.map((node,nodeIndex)=>{node.key = rowIndex*gridSize+nodeIndex})
  // })
  // const matrix = new Array(gridSize).fill(null).map((currentElement, elementIndex) => {
  //   try {
  //     return new Array(gridSize).fill(<Cell onClick={selectedTool} bigness={cellSize}/>);
  //   } finally {
  //     console.log(count);
  //     count++;
  //   }
  // });
  const [grid, setGrid] = useState(matrix);

  const gridBoundries = {
    minWidth: (matrix.length)*cellSize,
    maxWidth:(matrix.length)*cellSize,
  }
  return (
    <div style={gridBoundries} className="matrix-container"> 
      {console.log(grid)}
      <h1>A* Pathfinding Demo</h1>
      {matrix}
      {/* {grid} */}
      <button onClick={() => setSelectedTool('start')}>Start</button>
      <button onClick={() => setSelectedTool('finish')}>Finish</button>
      <button onClick={() => setSelectedTool('wall')}>Wall</button>
      
    </div>
  );
}

export default App;