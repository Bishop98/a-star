import React, {useRef, useState} from 'react';
import Cell from './components/cell.js';
import flatten from './functions/flatten.js';
import './App.css';

const jw = require('./assets/favicon-32x32.png');
const github = require('./assets/GitHub-Mark-64px.png');
//Maffah mah'iks

function App() {
  const gridSize = 15;
  const stateToolCorrelation = { //reduces the amound of if statements we need to do
    "walkable":"w",
    "wall":"W",
    "finish":"f",
    "start":"s"
  }
  const [appState, setAppState] = useState({
    gridSize: gridSize, //the height and width of our grid in nodes, definded outside of appState so that FEN can access it
    cellSize: 40, //the height and width of each node on our grid in pixels
    start: 0, //the index of the start position and finish position
    finish: 1,
    FEN: "w".repeat(gridSize*gridSize), // "Forsyth-Edwards Notation"-esque string to represent our grid: "w" == walkable, "s" == start "f" == finish "W" == wall "S" == solved path
    selectedTool: "start", //current selected tool
    mouseDown: false
  });

  const nodeClickHandle = (node) => {
    let newAppState = appState; //clone our current appstate
    let newFENArray = newAppState.FEN.split('') //split our FEN string into an array for easier manipulation. pretty inefficient could be improved
    newFENArray = newFENArray.map(x=>x==="S"?x="w":x)
    console.log(Math.floor(node.index/gridSize)+", "+(node.index%gridSize));
    if (appState.selectedTool === "start") {
      newFENArray[newAppState.start] = "w";//set current start to walkable
      newAppState.start = node.index; //update cloned state start index
      newFENArray[node.index] = "s"; //update start position on our cloned FEN array
    } else if (appState.selectedTool === "finish") {//  ^^^ same thing as above but for finish
      newFENArray[newAppState.finish] = "w";
      newAppState.finish = node.index;
      newFENArray[node.index] = "f";
    } else {
      newFENArray[node.index] = stateToolCorrelation[appState.selectedTool] //look in the stateToolCorrelation object for selected tool. Allows us to create new buttons and update cell component for new tools
    }
    newAppState.FEN = newFENArray.join('');
    setMatrix(Array.from(appState.FEN, (node, nodeIndex) => (<Cell key={nodeIndex} nodeIndex={nodeIndex} mouseover={nodeHover} clicked={nodeClickHandle} appState={newAppState}/>)))
    setAppState(newAppState);
  }

  const nodeHover = (node) => {
    if (appState.mouseDown) {
      if (appState.selectedTool === 'wall' || appState.selectedTool === 'walkable') {
        nodeClickHandle(node);
      }
    }
  }

  const aStar = (currentState) => {
    const gridPosFromIndex = function (target) { //need to convert index of node into a 2d position so that we can calculate distances between two points
      return [Math.floor(target/gridSize), (target%gridSize)];
    };
    const indexFromGridPos = (target) => {
      return Number(target[1])+gridSize*Number(target[0]);
    }
    const getDistance = function (a, b) {
      return Math.sqrt(Math.pow((a[0]-b[0]),2)+Math.pow((a[1]-b[1]),2))
    }
    let newAppState = currentState;
    let newFENArray = newAppState.FEN.split('')
    newFENArray = newFENArray.map(x=>x==="S"?x="w":x)
    const startPos = gridPosFromIndex(currentState.start);
    const finishPos = gridPosFromIndex(currentState.finish);
    let nodeArray = Array.from(Array(gridSize), () => new Array(gridSize).fill("unexplored"))
    nodeArray[startPos[0]][startPos[1]] = {
      "index" : currentState.start,
      "gridPos" : gridPosFromIndex(currentState.start),
      "path" : [],
      "gCost" : 0,
      "hCost" : getDistance(startPos, finishPos),
      "fCost" : getDistance(startPos, finishPos)
    };
    const startData = nodeArray[startPos[0]][startPos[1]]
    let openArr = [startData];
    let closed = [];
    let foundPath = [];
    const getAdjacent = function (target) { //gets the 8 closest nodes around a given node index
      const targetPosition = gridPosFromIndex(target)
      const relativityMatrix = [
        [targetPosition[0]-1, targetPosition[1]-1],[targetPosition[0]-1,targetPosition[1]],[targetPosition[0]-1, targetPosition[1]+1],
        [targetPosition[0],targetPosition[1]-1],[targetPosition[0], targetPosition[1]],[targetPosition[0],targetPosition[1]+1],
        [targetPosition[0]+1, targetPosition[1]-1],[targetPosition[0]+1,targetPosition[1]],[targetPosition[0]+1,targetPosition[1]+1]
      ].map((pos)=>{
        if (pos.indexOf(-1) >= 0 || pos.indexOf(gridSize) >= 0) { //if the position is -1 or gridSize, return null else return the position
          return null
        } else {
          if (newFENArray[Number(pos[1])+gridSize*Number(pos[0])] === "W") {
            return null;
          } else if (newFENArray[Number(pos[1])+gridSize*Number(pos[0])] === "f") {
            return pos
          } else {
            return pos
          }
        }
      });
      return relativityMatrix
    }

    while (foundPath.length === 0 && openArr.length > 0) {
      if (openArr.length === 0) {
        console.log("no path found");
      }
      openArr.sort((a,b)=> a.fCost - b.fCost)
      const current = openArr[0]
      const index = openArr.indexOf(current);
      if (index > -1) {
        openArr.splice(index, 1);
      }
      closed.push(current)
      if (indexFromGridPos(current.gridPos) === currentState.finish) {
        foundPath = current.path;
        break;
      }
      const adj = getAdjacent(current.index);
      let numNull = 0;
      adj.forEach(function(neighborPosition) {
        if (neighborPosition !== null) {
          const i = indexFromGridPos(neighborPosition)
          let nodeData = {
            "index" : i,
            "gridPos" : neighborPosition,
            "path" : [i, current.path],
            "gCost" : getDistance(current.gridPos, neighborPosition) + Number(current.gCost),
            "hCost" : getDistance(current.gridPos, finishPos),
            "fCost" : 0
          }
          const neighborPositionInClosed = closed.map(e=> {return e.gridPos.toString()}).indexOf(neighborPosition.toString());
          if (neighborPositionInClosed > -1) {
          } else if (nodeArray[neighborPosition[0]][neighborPosition[1]] === "unexplored") {
            nodeArray[neighborPosition[0]][neighborPosition[1]] = nodeData
            if (openArr.map(e=>e.gridPos.toString()).indexOf(neighborPosition.toString()) === -1) {
              nodeData.fCost = nodeData.gCost + nodeData.hCost;
              nodeArray[neighborPosition[0]][neighborPosition[1]] = nodeData
              if (openArr.map(e=>e.gridPos.toString()).indexOf(neighborPosition.toString()) === -1) {
                return openArr.push(nodeData)
              }
            }
          } else {
            
          }
        } else if (neighborPosition === null) {
          if (numNull === adj.length-1) {
            foundPath.push("blocked")
            numNull ++
          }
        }
      })
    };
    const flattened = flatten(foundPath);
    flattened.map(x=>newFENArray[x] = 'S')
    console.log(flattened);
    newFENArray[currentState.finish] = "f";
    newAppState.FEN = newFENArray.join('');
    setMatrix(Array.from(appState.FEN, (node, nodeIndex) => (<Cell key={nodeIndex} nodeIndex={nodeIndex} mouseover={nodeHover} clicked={nodeClickHandle} appState={newAppState}/>)))
    setAppState(newAppState);
  }
  
  const [matrix, setMatrix] = useState(Array.from(appState.FEN, (node, nodeIndex) => (<Cell key={nodeIndex} nodeIndex={nodeIndex} mouseover={nodeHover} clicked={nodeClickHandle} appState={appState}/>)))

  const gridBoundries = {
    minWidth: (matrix.length/appState.gridSize)*appState.cellSize,
    maxWidth: (matrix.length/appState.gridSize)*appState.cellSize,
  }

  const changerChange = (event) => {
    let newAppState = appState;
    newAppState.selectedTool = event.target.value;
    setMatrix(Array.from(appState.FEN, (node, nodeIndex) => (<Cell key={nodeIndex} nodeIndex={nodeIndex} mouseover={nodeHover} clicked={nodeClickHandle} appState={newAppState}/>)))
    setAppState(newAppState);
  }

  const selectedStyle = {
    backgroundColor: "green",
    color: "white",
    fontWeight: 600
  }

  const unselectedStyle = {
    backgroundColor: "white",
    color: "black",
    font: "regular"
  }

  const mouseDown = () => {
    let newAppState = appState;
    newAppState.mouseDown = true;
    console.log("down")
    setAppState(newAppState)
  }

  const mouseUp=() => {
    let newAppState = appState;
    newAppState.mouseDown = false;
    console.log("up")
    setAppState(newAppState)
  }


  const matrixElement = useRef(null);

  const nodePosFromTouchCoord = (coord) => {
    return [Math.floor(coord[1]/appState.cellSize), Math.floor(coord[0]/appState.cellSize)]
  }

  const nodeIndexFromCoord = (coord) => {
    const fart = nodePosFromTouchCoord(coord)
    return Number(fart[1])+gridSize*Number(fart[0])
  }

  const touchMove = (event) => {
    const matrixEl = matrixElement.current.getBoundingClientRect()
    if (event.touches[0].clientX >= 0 && event.touches[0].clientY-matrixEl.top >= 0 && event.touches[0].clientX <= (gridSize * appState.cellSize) && event.touches[0].clientY-matrixEl.top <= (gridSize * appState.cellSize)) {
      if (appState.selectedTool === "wall" || appState.selectedTool === "walkable") {
        const hoveredNode = nodeIndexFromCoord([event.touches[0].clientX, event.touches[0].clientY-matrixEl.top])
        let newAppState = appState; //clone our current appstate
        let newFENArray = newAppState.FEN.split('')
        newFENArray = newFENArray.map(x=>x==="S"?x="w":x)
        newFENArray[hoveredNode] = stateToolCorrelation[appState.selectedTool]
        newAppState.FEN = newFENArray.join('');
        setMatrix(Array.from(appState.FEN, (node, nodeIndex) => (<Cell key={nodeIndex} nodeIndex={nodeIndex} mouseover={nodeHover} clicked={nodeClickHandle} appState={newAppState}/>)))
        setAppState(newAppState);
      }
      // setHoveredNode(nodeIndexFromCoord([event.touches[0].clientX, event.touches[0].clientY-matrixEl.top]))
    }
  }

  return (
    <div style={gridBoundries} onChange={changerChange} onTouchMove={touchMove} onMouseDown={mouseDown} onMouseUp={mouseUp}className="matrix-container"> 
      <h1>A* Pathfinding Demo</h1>
      <label style={appState.selectedTool === 'start' ? selectedStyle : unselectedStyle}><input type='radio' id ='radioStart' value='start' name='tool-selector'/>Start</label>
      <label style={appState.selectedTool === 'finish' ? selectedStyle : unselectedStyle}><input type='radio' id ='radioFinish' value='finish' name='tool-selector'/>Finish</label>
      <label style={appState.selectedTool === 'wall' ? selectedStyle : unselectedStyle}><input type='radio' id ='radioWall' value='wall' name='tool-selector'/>Wall</label>
      <label style={appState.selectedTool === 'walkable' ? selectedStyle : unselectedStyle}><input type='radio' id ='radioWalkable' value='walkable' name='tool-selector'/>Walkable</label>
      {/* <p style={{display: "inline"}}>{hoveredNode}</p> */}
      <button onClick={()=>aStar(appState)}>Solve</button>
      <div ref={matrixElement} className="node-matrix" onTouchMove={touchMove}>{matrix}</div>
      <div className="media-links">
        <a rel="noopener noreferrer" target="_blank" href="https://github.com/Bishop98/a-star">
          <img alt="link to github repo of this project" src={github} height="32px"/>
        </a>
        <a rel="noopener noreferrer" target="_blank" href="https://devjosh.ca">
          <img alt="link back to devjosh.ca" src={jw} height="32px"/>
        </a>
      </div>
    </div>
  );
}

export default App;