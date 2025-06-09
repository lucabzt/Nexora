import StringToReactComponent from 'string-to-react-component';
import * as Recharts from 'recharts';
import * as Chakra from "@chakra-ui/react"
import React from "react";
import { ChakraProvider } from "@chakra-ui/react"

// Plugins/Libraries available to the agent

// 1. Latex
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import PaperBackground from "./PaperBackground.jsx";

const plugins = "Latex, Recharts"

const header = `(props) => {
      const {${plugins}}=props;
`

function TestComponent() {
    const [selectedFunction, setSelectedFunction] = React.useState('polynomial');
    const [derivativePoint, setDerivativePoint] = React.useState(2);
    const [integralA, setIntegralA] = React.useState(0);
    const [integralB, setIntegralB] = React.useState(4);
    const [showTangent, setShowTangent] = React.useState(true);
    const [showArea, setShowArea] = React.useState(true);
    const [animationSpeed, setAnimationSpeed] = React.useState(1);
    const [currentSection, setCurrentSection] = React.useState('introduction');
    const [showDerivativeSteps, setShowDerivativeSteps] = React.useState(false);
    const [limitH, setLimitH] = React.useState(1);

    const functions = {
        polynomial: {
            name: 'Polynomial',
            expr: 'f(x) = x² - 2x + 1',
            latex: 'f(x) = x^2 - 2x + 1',
            f: (x) => x * x - 2 * x + 1,
            derivative: (x) => 2 * x - 2,
            derivativeExpr: "f'(x) = 2x - 2",
            derivativeLatex: "f'(x) = 2x - 2",
            integral: (x) => (x * x * x) / 3 - x * x + x,
            integralExpr: 'F(x) = x³/3 - x² + x',
            integralLatex: 'F(x) = \\frac{x^3}{3} - x^2 + x'
        },
        sine: {
            name: 'Sine Wave',
            expr: 'f(x) = sin(x)',
            latex: 'f(x) = \\sin(x)',
            f: (x) => Math.sin(x),
            derivative: (x) => Math.cos(x),
            derivativeExpr: "f'(x) = cos(x)",
            derivativeLatex: "f'(x) = \\cos(x)",
            integral: (x) => -Math.cos(x),
            integralExpr: 'F(x) = -cos(x)',
            integralLatex: 'F(x) = -\\cos(x)'
        },
        exponential: {
            name: 'Exponential',
            expr: 'f(x) = eˣ',
            latex: 'f(x) = e^x',
            f: (x) => Math.exp(x),
            derivative: (x) => Math.exp(x),
            derivativeExpr: "f'(x) = eˣ",
            derivativeLatex: "f'(x) = e^x",
            integral: (x) => Math.exp(x),
            integralExpr: 'F(x) = eˣ',
            integralLatex: 'F(x) = e^x'
        }
    };

    const generateFunctionData = () => {
        const data = [];
        const func = functions[selectedFunction];
        for (let x = -1; x <= 5; x += 0.1) {
            data.push({
                x: x,
                y: func.f(x),
                derivative: func.derivative(x)
            });
        }
        return data;
    };

    const generateTangentLine = () => {
        const func = functions[selectedFunction];
        const slope = func.derivative(derivativePoint);
        const yInt = func.f(derivativePoint) - slope * derivativePoint;

        const data = [];
        for (let x = derivativePoint - 1; x <= derivativePoint + 1; x += 0.1) {
            data.push({
                x: x,
                y: slope * x + yInt
            });
        }
        return data;
    };

    const generateAreaData = () => {
        const func = functions[selectedFunction];
        const data = [];
        for (let x = integralA; x <= integralB; x += 0.1) {
            data.push({
                x: x,
                y: Math.max(0, func.f(x)),
                yNeg: Math.min(0, func.f(x))
            });
        }
        return data;
    };

    const calculateDefiniteIntegral = () => {
        const func = functions[selectedFunction];
        return func.integral(integralB) - func.integral(integralA);
    };

    const generateLimitVisualization = () => {
        const func = functions[selectedFunction];
        const data = [];
        const baseX = derivativePoint;

        // Generate secant lines with decreasing h values
        for (let i = 0; i < 20; i++) {
            const h = limitH * Math.pow(0.8, i);
            const slope = (func.f(baseX + h) - func.f(baseX)) / h;
            data.push({
                h: h,
                slope: slope,
                secantSlope: slope
            });
        }
        return data;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Notebook Header */}
                <div className="bg-white shadow-lg rounded-t-lg border-l-4 border-blue-500 p-6 mb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800 mb-2 font-serif">
                                📚 Interactive Calculus Notes
                            </h1>
                            <p className="text-lg text-gray-600 italic">
                                Exploring derivatives and integrals through visualization
                            </p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                            <div>Mathematics 101</div>
                            <div>Chapter 3: Calculus</div>
                            <div className="font-mono">Page 1</div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white border-l-4 border-blue-500 px-6 py-2">
                    <div className="flex space-x-6 text-sm">
                        {[
                            { key: 'introduction', label: '📖 Introduction' },
                            { key: 'limits', label: '🎯 Limits' },
                            { key: 'derivatives', label: '📈 Derivatives' },
                            { key: 'integrals', label: '🔢 Integrals' },
                            { key: 'applications', label: '🌍 Applications' }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setCurrentSection(tab.key)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    currentSection === tab.key 
                                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' 
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white shadow-lg rounded-b-lg border-l-4 border-blue-500 p-8 min-h-screen">

                    {/* Introduction Section */}
                    {currentSection === 'introduction' && (
                        <div className="space-y-8">
                            <div className="border-b-2 border-gray-200 pb-4">
                                <h2 className="text-3xl font-bold text-gray-800 mb-4 font-serif">
                                    What is Calculus? 🤔
                                </h2>
                                <div className="text-lg leading-relaxed text-gray-700">
                                    <p className="mb-4">
                                        Calculus is the mathematical study of <strong>change</strong> and <strong>accumulation</strong>.
                                        It's like having a mathematical microscope that lets us examine:
                                    </p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                                    <h3 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
                                        📈 Derivatives (Rates of Change)
                                    </h3>
                                    <p className="text-gray-700 mb-4">
                                        How fast is something changing at any given moment?
                                    </p>
                                    <div className="bg-white p-4 rounded-lg border">
                                        <div className="text-center text-lg">
                                            <Latex>{"The derivative of $f(x)$ is:"}</Latex>
                                        </div>
                                        <div className="text-center text-xl mt-2">
                                            <Latex>{"$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$"}</Latex>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-sm text-gray-600">
                                        <strong>Real examples:</strong> Speed of a car, slope of a curve, rate of population growth
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-200">
                                    <h3 className="text-2xl font-bold text-purple-800 mb-4 flex items-center">
                                        🔢 Integrals (Accumulation)
                                    </h3>
                                    <p className="text-gray-700 mb-4">
                                        How much has accumulated over a period of time?
                                    </p>
                                    <div className="bg-white p-4 rounded-lg border">
                                        <div className="text-center text-lg">
                                            <Latex>{"The definite integral:"}</Latex>
                                        </div>
                                        <div className="text-center text-xl mt-2">
                                            <Latex>{"$\\int_a^b f(x) dx = F(b) - F(a)$"}</Latex>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-sm text-gray-600">
                                        <strong>Real examples:</strong> Distance traveled, area under curves, total rainfall
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg">
                                <h4 className="text-xl font-bold text-yellow-800 mb-2">🧠 Why is this important?</h4>
                                <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
                                    <div>
                                        <strong>🚗 Physics:</strong> Motion, acceleration, forces
                                    </div>
                                    <div>
                                        <strong>💰 Economics:</strong> Marginal cost, optimization
                                    </div>
                                    <div>
                                        <strong>🧬 Biology:</strong> Population dynamics, drug concentration
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Limits Section */}
                    {currentSection === 'limits' && (
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-serif border-b-2 border-gray-200 pb-4">
                                🎯 Understanding Limits
                            </h2>

                            <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                                <h3 className="text-2xl font-bold text-blue-800 mb-4">
                                    The Foundation of Calculus
                                </h3>
                                <p className="text-lg text-gray-700 mb-4">
                                    A limit describes what happens to a function as the input approaches a particular value.
                                    It's the key to understanding derivatives!
                                </p>
                                <div className="text-center text-xl">
                                    <Latex>{"$\\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h} = f'(x)$"}</Latex>
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-xl font-bold mb-4">Interactive Limit Visualization</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                h value: {limitH.toFixed(3)}
                                            </label>
                                            <input
                                                type="range"
                                                min="0.01"
                                                max="2"
                                                step="0.01"
                                                value={limitH}
                                                onChange={(e) => setLimitH(parseFloat(e.target.value))}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2">Function:</label>
                                            <select
                                                value={selectedFunction}
                                                onChange={(e) => setSelectedFunction(e.target.value)}
                                                className="w-full p-2 border border-gray-300 rounded-lg"
                                            >
                                                {Object.entries(functions).map(([key, func]) => (
                                                    <option key={key} value={key}>{func.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="bg-white p-4 rounded-lg border">
                                            <div className="text-sm text-gray-600 mb-2">Current secant slope:</div>
                                            <div className="text-lg font-mono">
                                                {(
                                                    (functions[selectedFunction].f(derivativePoint + limitH) -
                                                     functions[selectedFunction].f(derivativePoint)) / limitH
                                                ).toFixed(4)}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-2">
                                                True derivative: {functions[selectedFunction].derivative(derivativePoint).toFixed(4)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-80">
                                    <Recharts.LineChart width={400} height={300} data={generateFunctionData()}>
                                        <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <Recharts.XAxis dataKey="x" />
                                        <Recharts.YAxis />
                                        <Recharts.Line
                                            type="monotone"
                                            dataKey="y"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={false}
                                        />
                                        <Recharts.Line
                                            type="monotone"
                                            dataKey="y"
                                            stroke="#ef4444"
                                            strokeWidth={2}
                                            data={generateTangentLine()}
                                            dot={false}
                                            strokeDasharray="5 5"
                                        />
                                        <Recharts.Tooltip
                                            formatter={(value, name) => [value.toFixed(3), name === 'y' ? 'f(x)' : name]}
                                            labelFormatter={(label) => `x = ${label}`}
                                        />
                                    </Recharts.LineChart>
                                </div>
                            </div>

                            <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-lg">
                                <h4 className="text-lg font-bold text-amber-800 mb-2">💡 Key Insight</h4>
                                <p className="text-gray-700">
                                    As h gets smaller and smaller, the secant line approaches the tangent line.
                                    The slope of this tangent line is the derivative!
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Derivatives Section */}
                    {currentSection === 'derivatives' && (
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-serif border-b-2 border-gray-200 pb-4">
                                📈 Derivatives: The Rate of Change
                            </h2>

                            <div className="grid lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                                        <h3 className="text-xl font-bold text-green-800 mb-4">Interactive Controls</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Function:</label>
                                                <select
                                                    value={selectedFunction}
                                                    onChange={(e) => setSelectedFunction(e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                                >
                                                    {Object.entries(functions).map(([key, func]) => (
                                                        <option key={key} value={key}>{func.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Point of tangency: x = {derivativePoint}
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="4"
                                                    step="0.1"
                                                    value={derivativePoint}
                                                    onChange={(e) => setDerivativePoint(parseFloat(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="showTangent"
                                                    checked={showTangent}
                                                    onChange={(e) => setShowTangent(e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <label htmlFor="showTangent" className="text-sm">Show tangent line</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                                        <h3 className="text-lg font-bold mb-4">Current Function</h3>
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-sm text-gray-600">Function: </span>
                                                <span className="font-mono">
                                                    <Latex>{`$${functions[selectedFunction].latex}$`}</Latex>
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-600">Derivative: </span>
                                                <span className="font-mono">
                                                    <Latex>{`$${functions[selectedFunction].derivativeLatex}$`}</Latex>
                                                </span>
                                            </div>
                                            <div className="pt-2 border-t">
                                                <span className="text-sm text-gray-600">At x = {derivativePoint}: </span>
                                                <div className="mt-1">
                                                    <span className="text-sm">f({derivativePoint}) = </span>
                                                    <span className="font-bold">
                                                        {functions[selectedFunction].f(derivativePoint).toFixed(3)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-sm">f'({derivativePoint}) = </span>
                                                    <span className="font-bold text-green-600">
                                                        {functions[selectedFunction].derivative(derivativePoint).toFixed(3)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-96">
                                    <Recharts.LineChart width={450} height={380} data={generateFunctionData()}>
                                        <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <Recharts.XAxis
                                            dataKey="x"
                                            label={{ value: 'x', position: 'insideBottom', offset: -5 }}
                                        />
                                        <Recharts.YAxis
                                            label={{ value: 'f(x)', angle: -90, position: 'insideLeft' }}
                                        />
                                        <Recharts.Line
                                            type="monotone"
                                            dataKey="y"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={false}
                                            name="f(x)"
                                        />
                                        {showTangent && (
                                            <Recharts.Line
                                                type="monotone"
                                                dataKey="y"
                                                stroke="#ef4444"
                                                strokeWidth={2}
                                                data={generateTangentLine()}
                                                dot={false}
                                                strokeDasharray="5 5"
                                                name="Tangent line"
                                            />
                                        )}
                                        <Recharts.ReferenceDot
                                            x={derivativePoint}
                                            y={functions[selectedFunction].f(derivativePoint)}
                                            r={6}
                                            fill="#22c55e"
                                            stroke="#16a34a"
                                            strokeWidth={2}
                                        />
                                        <Recharts.Tooltip
                                            formatter={(value, name) => [value.toFixed(3), name]}
                                            labelFormatter={(label) => `x = ${label}`}
                                        />
                                    </Recharts.LineChart>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                                <h3 className="text-xl font-bold text-blue-800 mb-4">🔍 Derivative Rules (Margin Notes)</h3>
                                <div className="grid md:grid-cols-2 gap-6 text-sm">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center border-b pb-1">
                                            <span>Power Rule:</span>
                                            <span className="font-mono"><Latex>{"$\\frac{d}{dx}x^n = nx^{n-1}$"}</Latex></span>
                                        </div>
                                        <div className="flex justify-between items-center border-b pb-1">
                                            <span>Chain Rule:</span>
                                            <span className="font-mono"><Latex>{"$\\frac{d}{dx}f(g(x)) = f'(g(x)) \\cdot g'(x)$"}</Latex></span>
                                        </div>
                                        <div className="flex justify-between items-center border-b pb-1">
                                            <span>Product Rule:</span>
                                            <span className="font-mono"><Latex>{"$(fg)' = f'g + fg'$"}</Latex></span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center border-b pb-1">
                                            <span>Sine:</span>
                                            <span className="font-mono"><Latex>{"$\\frac{d}{dx}\\sin(x) = \\cos(x)$"}</Latex></span>
                                        </div>
                                        <div className="flex justify-between items-center border-b pb-1">
                                            <span>Exponential:</span>
                                            <span className="font-mono"><Latex>{"$\\frac{d}{dx}e^x = e^x$"}</Latex></span>
                                        </div>
                                        <div className="flex justify-between items-center border-b pb-1">
                                            <span>Logarithm:</span>
                                            <span className="font-mono"><Latex>{"$\\frac{d}{dx}\\ln(x) = \\frac{1}{x}$"}</Latex></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Integrals Section */}
                    {currentSection === 'integrals' && (
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-serif border-b-2 border-gray-200 pb-4">
                                🔢 Integrals: Finding the Area
                            </h2>

                            <div className="grid lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
                                        <h3 className="text-xl font-bold text-purple-800 mb-4">Integration Controls</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Function:</label>
                                                <select
                                                    value={selectedFunction}
                                                    onChange={(e) => setSelectedFunction(e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                                >
                                                    {Object.entries(functions).map(([key, func]) => (
                                                        <option key={key} value={key}>{func.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Lower bound (a): {integralA}
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="3"
                                                    step="0.1"
                                                    value={integralA}
                                                    onChange={(e) => setIntegralA(parseFloat(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Upper bound (b): {integralB}
                                                </label>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="5"
                                                    step="0.1"
                                                    value={integralB}
                                                    onChange={(e) => setIntegralB(parseFloat(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id="showArea"
                                                    checked={showArea}
                                                    onChange={(e) => setShowArea(e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <label htmlFor="showArea" className="text-sm">Show area under curve</label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                                        <h3 className="text-lg font-bold mb-4">Integration Result</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-sm text-gray-600">Function: </span>
                                                <span className="font-mono">
                                                    <Latex>{`$${functions[selectedFunction].latex}$`}</Latex>
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-600">Antiderivative: </span>
                                                <span className="font-mono">
                                                    <Latex>{`$${functions[selectedFunction].integralLatex}$`}</Latex>
                                                </span>
                                            </div>
                                            <div className="pt-2 border-t">
                                                <div className="text-center">
                                                    <Latex>{`$\\int_{${integralA}}^{${integralB}} ${functions[selectedFunction].latex.split('=')[1]} dx$`}</Latex>
                                                </div>
                                                <div className="text-center text-lg font-bold text-purple-600 mt-2">
                                                    = {calculateDefiniteIntegral().toFixed(3)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-96">
                                    <Recharts.ComposedChart width={450} height={380} data={generateFunctionData()}>
                                        <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <Recharts.XAxis
                                            dataKey="x"
                                            label={{ value: 'x', position: 'insideBottom', offset: -5 }}
                                        />
                                        <Recharts.YAxis
                                            label={{ value: 'f(x)', angle: -90, position: 'insideLeft' }}
                                        />

                                        {showArea && (
                                            <Recharts.Area
                                                type="monotone"
                                                dataKey="y"
                                                data={generateAreaData()}
                                                stroke="none"
                                                fill="#a855f7"
                                                fillOpacity={0.3}
                                            />
                                        )}

                                        <Recharts.Line
                                            type="monotone"
                                            dataKey="y"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={false}
                                            name="f(x)"
                                        />

                                        <Recharts.ReferenceLine x={integralA} stroke="#ef4444" strokeDasharray="5 5" />
                                        <Recharts.ReferenceLine x={integralB} stroke="#ef4444" strokeDasharray="5 5" />

                                        <Recharts.Tooltip
                                            formatter={(value, name) => [value.toFixed(3), name]}
                                            labelFormatter={(label) => `x = ${label}`}
                                        />
                                    </Recharts.ComposedChart>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                                <h3 className="text-xl font-bold text-purple-800 mb-4">📝 Integration Techniques</h3>
                                <div className="grid md:grid-cols-2 gap-6 text-sm">
                                    <div className="space-y-2">
                                        <div className="border-b pb-1">
                                            <strong>Fundamental Theorem:</strong>
                                            <div className="font-mono mt-1">
                                                <Latex>{"$\\int_a^b f(x)dx = F(b) - F(a)$"}</Latex>
                                            </div>
                                        </div>
                                        <div className="border-b pb-1">
                                            <strong>Power Rule:</strong>
                                            <div className="font-mono mt-1">
                                                <Latex>{"$\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$"}</Latex>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="border-b pb-1">
                                            <strong>Substitution:</strong>
                                            <div className="font-mono mt-1">
                                                <Latex>{"$\\int f(g(x))g'(x)dx = F(g(x)) + C$"}</Latex>
                                            </div>
                                        </div>
                                        <div className="border-b pb-1">
                                            <strong>By Parts:</strong>
                                            <div className="font-mono mt-1">
                                                <Latex>{"$\\int udv = uv - \\int vdu$"}</Latex>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Applications Section */}
                    {currentSection === 'applications' && (
                        <div className="space-y-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-serif border-b-2 border-gray-200 pb-4">
                                🌍 Real-World Applications
                            </h2>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                                    <h3 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
                                        🚗 Motion and Velocity
                                    </h3>
                                    <p className="text-gray-700 mb-4">
                                        If position is given by <Latex>{"$s(t) = t^2 + 2t$"}</Latex>, then:
                                    </p>
                                    <div className="space-y-2 font-mono text-sm">
                                        <div>• Velocity: <Latex>{"$v(t) = s'(t) = 2t + 2$"}</Latex></div>
                                        <div>• Acceleration: <Latex>{"$a(t) = v'(t) = 2$"}</Latex></div>
                                    </div>
                                    <div className="mt-4 p-3 bg-white rounded border">
                                        <strong>At t = 3 seconds:</strong>
                                        <div className="text-sm mt-1">
                                            Position: 15 meters<br/>
                                            Velocity: 8 m/s<br/>
                                            Acceleration: 2 m/s²
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                                    <h3 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
                                        💰 Economics: Marginal Cost
                                    </h3>
                                    <p className="text-gray-700 mb-4">
                                        If cost function is <Latex>{"$C(x) = x^2 + 10x + 100$"}</Latex>, then:
                                    </p>
                                    <div className="space-y-2 font-mono text-sm">
                                        <div>• Marginal Cost: <Latex>{"$C'(x) = 2x + 10$"}</Latex></div>
                                        <div>• Total Cost for 50 units: <Latex>{"$C(50) = 3100$"}</Latex></div>
                                    </div>
                                    <div className="mt-4 p-3 bg-white rounded border">
                                        <strong>Interpretation:</strong>
                                        <div className="text-sm mt-1">
                                            The 51st unit costs approximately $110 to produce
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
                                    <h3 className="text-2xl font-bold text-purple-800 mb-4 flex items-center">
                                        📏 Optimization Problems
                                    </h3>
                                    <p className="text-gray-700 mb-4">
                                        Find the maximum area of a rectangle with perimeter 100:
                                    </p>
                                    <div className="space-y-2 font-mono text-sm">
                                        <div>• Area: <Latex>{"$A(x) = x(50-x) = 50x - x^2$"}</Latex></div>
                                        <div>• <Latex>{"$A'(x) = 50 - 2x = 0$"}</Latex></div>
                                        <div>• Solution: <Latex>{"$x = 25$"}</Latex></div>
                                    </div>
                                    <div className="mt-4 p-3 bg-white rounded border">
                                        <strong>Result:</strong>
                                        <div className="text-sm mt-1">
                                            Maximum area = 625 square units<br/>
                                            (when the rectangle is a square)
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-orange-50 p-6 rounded-xl border-2 border-orange-200">
                                    <h3 className="text-2xl font-bold text-orange-800 mb-4 flex items-center">
                                        🌊 Area Under Curves
                                    </h3>
                                    <p className="text-gray-700 mb-4">
                                        Find the area between <Latex>{"$y = x^2$"}</Latex> and <Latex>{"$y = 4$"}</Latex>:
                                    </p>
                                    <div className="space-y-2 font-mono text-sm">
                                        <div>• Intersection points: <Latex>{"$x = \\pm 2$"}</Latex></div>
                                        <div>• Area: <Latex>{"$\\int_{-2}^{2} (4 - x^2) dx$"}</Latex></div>
                                        <div>• <Latex>{"$= [4x - \\frac{x^3}{3}]_{-2}^{2} = \\frac{32}{3}$"}</Latex></div>
                                    </div>
                                    <div className="mt-4 p-3 bg-white rounded border">
                                        <strong>Result:</strong>
                                        <div className="text-sm mt-1">
                                            Area ≈ 10.67 square units
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-8 rounded-xl border-2 border-indigo-200">
                                <h3 className="text-2xl font-bold text-indigo-800 mb-6 text-center">
                                    🎓 Summary: The Power of Calculus
                                </h3>
                                <div className="grid md:grid-cols-3 gap-6 text-center">
                                    <div className="bg-white p-4 rounded-lg border">
                                        <div className="text-3xl mb-2">📊</div>
                                        <h4 className="font-bold text-gray-800 mb-2">Analyze Change</h4>
                                        <p className="text-sm text-gray-600">
                                            Derivatives help us understand rates of change in any system
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border">
                                        <div className="text-3xl mb-2">📐</div>
                                        <h4 className="font-bold text-gray-800 mb-2">Find Optimal Solutions</h4>
                                        <p className="text-sm text-gray-600">
                                            Calculus helps us maximize profits, minimize costs, and optimize designs
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border">
                                        <div className="text-3xl mb-2">🔄</div>
                                        <h4 className="font-bold text-gray-800 mb-2">Accumulate Effects</h4>
                                        <p className="text-sm text-gray-600">
                                            Integrals let us find total distance, area, volume, and more
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Page Footer */}
                    <div className="mt-12 pt-6 border-t-2 border-gray-200 text-center text-sm text-gray-500">
                        <div className="flex justify-between items-center">
                            <div>Interactive Calculus Notes</div>
                            <div>Mathematics 101 - Chapter 3</div>
                            <div className="font-mono">End of Notes</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AiCodeWrapper({ children }) {
    const full_react_component =
        `
        ${header}
        `
    //${recharttest}
    console.log(full_react_component)
    //<StringToReactComponent data={{Latex, Recharts}}>
     //   {full_react_component}
    //</StringToReactComponent>
    return (
    <PaperBackground>
        <TestComponent/>
    </PaperBackground>
    )
}

export default AiCodeWrapper