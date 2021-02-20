import React, { useState } from 'react';

const Cell = (props) => {
    const [gridPos, setGridPos] = useState();
    const [color, setColor] = useState('white');
    const mystyle = {
        backgroundColor: color,
        border: "1px solid black",
        margin:0,
        marginBottom: -4,
        padding: Number((props.bigness/2)-1),
        width: props.bigness,
        boxSizing: "border-box",
        display: "inline-block"
      };
    const updateColor = () => {
      if (props.currentTool === 'start') {
        setColor('green');
      } else if (props.currentTool === 'finish') {
        setColor('red');
      } else if (props.currentTool === 'wall') {
        setColor('black');
      }
    };
    console.log(props.poopy);
    return <div style={mystyle} onClick={() => {console.log(props.onClick)}}></div>
}

export default Cell;