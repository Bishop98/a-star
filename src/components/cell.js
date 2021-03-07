import React from 'react';

const Cell = (props) => {
  const decideColor = () => {
    const stateColorCorrelation = {
      "w":"white",
      "W":"black",
      "f":"red",
      "s":"green",
      "S":"cyan"
    }
    return stateColorCorrelation[props.appState.FEN[props.nodeIndex]]
  }
  const cellStyle = {
    backgroundColor: decideColor(),
    border: "1px solid black",
    margin:0,
    marginBottom: -4,
    padding: Number((props.appState.cellSize/2)-1),
    width: props.appState.cellSize,
    boxSizing: "border-box",
    display: "inline-block"
  };
  return <div style={cellStyle} onMouseOver={()=>props.mouseover({index:props.nodeIndex})} onClick={()=>props.clicked({index:props.nodeIndex})}></div>
}

export default Cell;