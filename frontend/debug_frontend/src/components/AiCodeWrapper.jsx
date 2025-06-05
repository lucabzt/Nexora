// Plugins
import StringToReactComponent from 'string-to-react-component';
import { processAICodeWithLatex } from './utils/StringLatex.jsx';

const header = `(props) => {
    const { Latex, SafeLatex, latexExpressions } = props;
`;

function AiCodeWrapper({ children }) {
    // Process the AI-generated code to handle LaTeX safely
    const { processedCode, componentData, stats } = processAICodeWithLatex(children);

    // Build the complete React component string
    const full_react_component = `
        ${header}
        ${processedCode}
        }
    `;

    // Debug logging (optional)
    console.log(`AiCodeWrapper: Processed ${stats.totalExpressions} LaTeX expressions`);

    return (
        <StringToReactComponent data={componentData}>
            {full_react_component}
        </StringToReactComponent>
    );
}

export default AiCodeWrapper;