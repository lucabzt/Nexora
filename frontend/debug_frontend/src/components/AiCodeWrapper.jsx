import React, { Suspense, lazy } from "react";
import * as Recharts from 'recharts';
import PaperBackground from "./PaperBackground.jsx";


const LazyPlot = lazy(() => import('react-plotly.js'));
// Plugins/Libraries available to the agent

// 1. Latex
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

const plugins = "Latex, Recharts, Plot"

const header = `(props) => {
      const {${plugins}}=props;
`
/*
function TestComponent() {
    return (
      <Suspense fallback={
        <div>Loading Plotly...</div>
      } >
        <LazyPlot
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
      </Suspense>
    );
}
*/


const LazyStringToReactComponent = lazy(() => import('string-to-react-component'));

function AiCodeWrapper({ children }) {
    const full_react_component =
        `
        ${header}
        ${children}
        `
    console.log(full_react_component)

    return (
        <PaperBackground>
            <Suspense fallback={<div>Loading component...</div>}>
                <LazyStringToReactComponent data={{Latex, Recharts, Plot: LazyPlot}}>
                    {full_react_component}
                </LazyStringToReactComponent>
            </Suspense>
        </PaperBackground>
    )
}

export default AiCodeWrapper