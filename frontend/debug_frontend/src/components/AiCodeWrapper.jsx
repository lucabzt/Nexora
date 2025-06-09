import StringToReactComponent from 'string-to-react-component';
import * as Recharts from 'recharts';
import React from "react";
import Plot from 'react-plotly.js';
import PaperBackground from "./PaperBackground.jsx";

// Plugins/Libraries available to the agent

// 1. Latex
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

const plugins = "Latex, Recharts, Plot"

const header = `(props) => {
      const {${plugins}}=props;
`

function TestComponent() {
    return (
      <Plot
        data={[
          {
            x: [1, 2, 3],
            y: [2, 6, 3],
            type: 'scatter',
            mode: 'lines+markers',
            marker: {color: 'red'},
          },
          {type: 'bar', x: [1, 2, 3], y: [2, 5, 3]},
        ]}
        layout={ {width: 320, height: 240, title: {text: 'A Fancy Plot'}} }
      />
    );
}

function AiCodeWrapper({ children }) {
    const full_react_component =
        `
        ${header}
        ${children}
        `
    //${recharttest}
    console.log(full_react_component)
    //<StringToReactComponent data={{Latex, Recharts}}>
     //   {full_react_component}
    //</StringToReactComponent>
    return (
    <PaperBackground>
        <StringToReactComponent data={{Latex, Recharts, Plot}}>
            {full_react_component}
        </StringToReactComponent>
    </PaperBackground>
    )
}

export default AiCodeWrapper