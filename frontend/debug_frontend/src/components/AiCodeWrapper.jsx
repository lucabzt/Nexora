import StringToReactComponent from 'string-to-react-component';

// Plugins/Libraries available to the agent

// 1. Latex
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

const header = `(props) => {
      const {Latex}=props;
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
    <StringToReactComponent data={{Latex}}>
        {full_react_component}
    </StringToReactComponent>
    )
}

export default AiCodeWrapper