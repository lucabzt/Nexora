import StringToReactComponent from 'string-to-react-component';
import * as Recharts from 'recharts';

// Plugins/Libraries available to the agent

// 1. Latex
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

const plugins = "Latex, Recharts"

const header = `(props) => {
      const {${plugins}}=props;
`

const recharttest = `
    const data = [{name: 'Page A', uv: 400}, {name: 'Page B', uv: 500}, {name: 'Page C', uv: 200}, {name: 'Page D', uv: 20}, {name: 'Page E', uv: 30}];
    
    return (
      <Recharts.LineChart width={600} height={300} data={data}>
        <Recharts.Line type="monotone" dataKey="uv" stroke="#8884d8" />
        <Recharts.CartesianGrid stroke="#ccc" />
        <Recharts.XAxis dataKey="name" />
        <Recharts.YAxis />
      </Recharts.LineChart>
    );
`

function AiCodeWrapper({ children }) {
    const full_react_component =
        `
        ${header}
        ${children}
        }
        `
    console.log(full_react_component)
    return (
    <StringToReactComponent data={{Latex, Recharts}}>
        {full_react_component}
    </StringToReactComponent>
    )
}

export default AiCodeWrapper