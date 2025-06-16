// This file serves as a playground for testing ai generated components
// Plugins/Libraries available to the agent
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import * as Recharts from 'recharts';
import * as RF from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Lazy load Plotly for better performance
const LazyPlot = React.lazy(() => import('react-plotly.js'));

// Visually appealing loader component
const PlotLoader = () => {
  const { t } = useTranslation('common');
  
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200 h-96 animate-pulse">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 text-lg font-medium">
        {t('loader.visualization.loading')}
      </p>
      <p className="text-sm text-gray-500 mt-2">
        {t('loader.visualization.thisMayTakeAMoment')}
      </p>
    </div>
  );
};

// Wrapper component to handle suspense for Plot
const PlotWithSuspense = (props) => (
  <Suspense fallback={<PlotLoader />}>
    <LazyPlot {...props} />
  </Suspense>
);

function TestComponent() {
  const [selectedComplexity, setSelectedComplexity] = React.useState('all');
  const [inputSize, setInputSize] = React.useState(20);
  const [selectedTreeType, setSelectedTreeType] = React.useState('binary');

  // Generate data for charts
  const generateData = (maxN) => {
    const data = [];
    for (let n = 1; n <= maxN; n++) {
      data.push({
        n,
        constant: 1,
        logarithmic: Math.log2(n),
        linear: n,
        linearithmic: n * Math.log2(n),
        quadratic: n * n,
        cubic: n * n * n,
      });
    }
    return data;
  };

  const complexityData = generateData(inputSize);

  const complexityInfo = {
    constant: { color: '#8884d8', name: 'O(1)', description: 'Constant time' },
    logarithmic: { color: '#82ca9d', name: 'O(log n)', description: 'Logarithmic time' },
    linear: { color: '#ffc658', name: 'O(n)', description: 'Linear time' },
    linearithmic: { color: '#ff7300', name: 'O(n log n)', description: 'Linearithmic time' },
    quadratic: { color: '#ff8042', name: 'O(n²)', description: 'Quadratic time' },
    cubic: { color: '#ff4444', name: 'O(n³)', description: 'Cubic time' },
  };

  const getVisibleLines = () => {
    if (selectedComplexity === 'all') return Object.keys(complexityInfo);
    return [selectedComplexity];
  };

  // Binary Tree nodes for ReactFlow
  const treeStructures = {
    binary: {
      nodes: [
        { id: '1', position: { x: 200, y: 0 }, data: { label: '50' }, style: { background: '#e3f2fd', border: '2px solid #1976d2', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        { id: '2', position: { x: 100, y: 100 }, data: { label: '30' }, style: { background: '#f3e5f5', border: '2px solid #7b1fa2', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        { id: '3', position: { x: 300, y: 100 }, data: { label: '70' }, style: { background: '#f3e5f5', border: '2px solid #7b1fa2', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        { id: '4', position: { x: 50, y: 200 }, data: { label: '20' }, style: { background: '#e8f5e8', border: '2px solid #388e3c', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        { id: '5', position: { x: 150, y: 200 }, data: { label: '40' }, style: { background: '#e8f5e8', border: '2px solid #388e3c', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        { id: '6', position: { x: 250, y: 200 }, data: { label: '60' }, style: { background: '#e8f5e8', border: '2px solid #388e3c', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        { id: '7', position: { x: 350, y: 200 }, data: { label: '80' }, style: { background: '#e8f5e8', border: '2px solid #388e3c', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#1976d2', strokeWidth: 3 } },
        { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#1976d2', strokeWidth: 3 } },
        { id: 'e2-4', source: '2', target: '4', style: { stroke: '#7b1fa2', strokeWidth: 2 } },
        { id: 'e2-5', source: '2', target: '5', style: { stroke: '#7b1fa2', strokeWidth: 2 } },
        { id: 'e3-6', source: '3', target: '6', style: { stroke: '#7b1fa2', strokeWidth: 2 } },
        { id: 'e3-7', source: '3', target: '7', style: { stroke: '#7b1fa2', strokeWidth: 2 } },
      ]
    },
    heap: {
      nodes: [
        { id: '1', position: { x: 200, y: 0 }, data: { label: '100' }, style: { background: '#ffecb3', border: '3px solid #ff8f00', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' } },
        { id: '2', position: { x: 100, y: 100 }, data: { label: '90' }, style: { background: '#fff3e0', border: '2px solid #ff8f00', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        { id: '3', position: { x: 300, y: 100 }, data: { label: '80' }, style: { background: '#fff3e0', border: '2px solid #ff8f00', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        { id: '4', position: { x: 50, y: 200 }, data: { label: '70' }, style: { background: '#fce4ec', border: '2px solid #e91e63', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        { id: '5', position: { x: 150, y: 200 }, data: { label: '60' }, style: { background: '#fce4ec', border: '2px solid #e91e63', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        { id: '6', position: { x: 250, y: 200 }, data: { label: '50' }, style: { background: '#fce4ec', border: '2px solid #e91e63', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        { id: '7', position: { x: 350, y: 200 }, data: { label: '40' }, style: { background: '#fce4ec', border: '2px solid #e91e63', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#ff8f00', strokeWidth: 3 } },
        { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#ff8f00', strokeWidth: 3 } },
        { id: 'e2-4', source: '2', target: '4', style: { stroke: '#e91e63', strokeWidth: 2 } },
        { id: 'e2-5', source: '2', target: '5', style: { stroke: '#e91e63', strokeWidth: 2 } },
        { id: 'e3-6', source: '3', target: '6', style: { stroke: '#e91e63', strokeWidth: 2 } },
        { id: 'e3-7', source: '3', target: '7', style: { stroke: '#e91e63', strokeWidth: 2 } },
      ]
    }
  };

  const currentTree = treeStructures[selectedTreeType];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header with Gradient */}
      <div className="text-center mb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-20 blur-3xl"></div>
        <div className="relative">
          <h1 className="text-7xl font-black mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Big O Notation
          </h1>
          <div className="text-2xl text-gray-700 max-w-4xl mx-auto font-medium">
            🚀 Master algorithm efficiency through
            <span className="text-purple-600 font-bold"> interactive visualizations</span> and
            <span className="text-blue-600 font-bold"> dynamic examples</span>
          </div>
        </div>
      </div>

      {/* Mathematical Definition */}
      <div className="mb-12 border-t-8 border-blue-400 p-8 shadow-lg">
        <h2 className="text-4xl font-bold mb-6 text-blue-800">🔢 Mathematical Foundation</h2>
        <p className="text-lg mb-6 text-gray-700">
          Big O notation describes the upper bound of algorithm complexity:
        </p>
        <div className="text-center text-xl p-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border-2 border-purple-300">
          <Latex>
            {"$f(n) = O(g(n))$ if there exist positive constants $c$ and $n_0$ such that:"}
          </Latex>
          <div className="mt-4 text-2xl">
            <Latex>
              {"$0 \\leq f(n) \\leq c \\cdot g(n)$ for all $n \\geq n_0$"}
            </Latex>
          </div>
        </div>
      </div>

      {/* Interactive Complexity Chart */}
      <div className="mb-12 border-t-8 border-green-400 p-8 shadow-lg">
        <h2 className="text-4xl font-bold mb-6 text-green-800">📈 Interactive Complexity Comparison</h2>

        <div className="flex flex-wrap gap-6 mb-8">
          <div className="flex items-center gap-3">
            <label className="text-lg font-medium">📏 Input Size (n):</label>
            <input
              type="range"
              min="10"
              max="100"
              value={inputSize}
              onChange={(e) => setInputSize(parseInt(e.target.value))}
              className="w-40"
            />
            <span className="text-lg font-mono bg-green-100 px-3 py-1 rounded">{inputSize}</span>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-lg font-medium">🎯 Focus on:</label>
            <select
              value={selectedComplexity}
              onChange={(e) => setSelectedComplexity(e.target.value)}
              className="text-lg border-2 border-gray-300 rounded px-3 py-1"
            >
              <option value="all">All Complexities</option>
              {Object.entries(complexityInfo).map(([key, info]) => (
                <option key={key} value={key}>{info.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full h-96 mb-6">
          <Recharts.LineChart width={900} height={350} data={complexityData}>
            <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <Recharts.XAxis
              dataKey="n"
              tick={{ fontSize: 14 }}
              label={{ value: 'Input Size (n)', position: 'insideBottom', offset: -10 }}
            />
            <Recharts.YAxis
              tick={{ fontSize: 14 }}
              label={{ value: 'Operations', angle: -90, position: 'insideLeft' }}
            />
            <Recharts.Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                border: '2px solid #ccc',
                borderRadius: '8px'
              }}
            />
            {getVisibleLines().map(complexity => (
              <Recharts.Line
                key={complexity}
                type="monotone"
                dataKey={complexity}
                stroke={complexityInfo[complexity].color}
                strokeWidth={3}
                name={complexityInfo[complexity].name}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </Recharts.LineChart>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(complexityInfo).map(([key, info]) => (
            <div
              key={key}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                selectedComplexity === key || selectedComplexity === 'all' 
                  ? 'shadow-lg transform scale-105' 
                  : 'opacity-70 hover:opacity-100'
              }`}
              onClick={() => setSelectedComplexity(selectedComplexity === key ? 'all' : key)}
              style={{
                borderColor: info.color,
                backgroundColor: `${info.color}25`
              }}
            >
              <div className="text-center">
                <div className="font-mono text-lg font-bold mb-2" style={{ color: info.color }}>
                  {info.name}
                </div>
                <div className="text-sm text-gray-700 font-medium">{info.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tree Data Structures */}
      <div className="mb-12 border-t-8 border-purple-400 p-8 shadow-lg">
        <h2 className="text-4xl font-bold mb-6 text-purple-800">🌳 Tree Data Structures</h2>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setSelectedTreeType('binary')}
            className={`px-6 py-3 rounded-lg font-bold text-lg transition-all duration-300 shadow-md ${
              selectedTreeType === 'binary' 
                ? 'bg-purple-500 text-white transform scale-105 shadow-lg' 
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200 hover:scale-105'
            }`}
          >
            🔍 Binary Search Tree - O(log n)
          </button>
          <button
            onClick={() => setSelectedTreeType('heap')}
            className={`px-6 py-3 rounded-lg font-bold text-lg transition-all duration-300 shadow-md ${
              selectedTreeType === 'heap' 
                ? 'bg-purple-500 text-white transform scale-105 shadow-lg' 
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200 hover:scale-105'
            }`}
          >
            ⛰️ Max Heap - O(log n) insert
          </button>
        </div>

        <div className="border-2 border-purple-200 rounded-xl overflow-hidden">
          <div style={{ width: '100%', height: '350px' }}>
            <RF.ReactFlow
              nodes={currentTree.nodes}
              edges={currentTree.edges}
              fitView
              attributionPosition="bottom-left"
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
            >
              <RF.Controls />
              <RF.Background variant="dots" gap={16} size={2} color="#e5e7eb" />
            </RF.ReactFlow>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border-2 border-blue-300">
            <h3 className="text-xl font-bold text-blue-800 mb-3">🔍 Binary Search Tree</h3>
            <p className="text-gray-700">
              Left child &lt; Parent &lt; Right child. Search, insert, and delete operations are O(log n) on average.
            </p>
          </div>
          <div className="p-6 rounded-xl border-2 border-orange-300">
            <h3 className="text-xl font-bold text-orange-800 mb-3">⛰️ Max Heap</h3>
            <p className="text-gray-700">
              Parent ≥ Children. Perfect for priority queues. Insert and extract-max are O(log n) operations.
            </p>
          </div>
        </div>
      </div>

      {/* 3D Complexity Visualization */}
      <div className="mb-12 border-t-8 border-red-400 p-8 shadow-lg">
        <h2 className="text-4xl font-bold mb-6 text-red-800">🎯 3D Complexity Surface</h2>
        <p className="text-lg mb-6 text-gray-700 font-medium">
          🚀 Visualizing how <span className="font-bold text-red-600">O(n²)</span> complexity explodes with input size:
        </p>

        <div className="flex justify-center">
          <PlotWithSuspense
            data={[
              {
                x: Array.from({length: 20}, (_, i) => i + 1),
                y: Array.from({length: 20}, (_, i) => i + 1),
                z: Array.from({length: 20}, (_, i) =>
                  Array.from({length: 20}, (_, j) => (i + 1) * (j + 1))
                ),
                type: 'surface',
                colorscale: [
                  [0, '#fef3c7'],
                  [0.5, '#f59e0b'],
                  [1, '#dc2626']
                ],
                showscale: true,
                colorbar: {
                  title: 'Operations',
                  titlefont: { color: '#dc2626' }
                }
              }
            ]}
            layout={{
              width: 700,
              height: 500,
              title: {
                text: 'O(n²) Complexity Growth - The Exponential Mountain',
                font: { size: 18, color: '#dc2626' }
              },
              scene: {
                xaxis: {
                  title: 'Input Size X',
                  titlefont: { color: '#dc2626' }
                },
                yaxis: {
                  title: 'Input Size Y',
                  titlefont: { color: '#dc2626' }
                },
                zaxis: {
                  title: 'Operations',
                  titlefont: { color: '#dc2626' }
                },
                camera: {
                  eye: { x: 1.5, y: 1.5, z: 1.5 }
                }
              },
              margin: { l: 0, r: 0, b: 0, t: 50 }
            }}
            config={{ displayModeBar: true }}
          />
        </div>
      </div>

      {/* Code Examples */}
      <div className="mb-12 border-t-8 border-yellow-400 p-8 shadow-lg">
        <h2 className="text-4xl font-bold mb-6 text-yellow-800">💻 Algorithm Implementations</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-6 rounded-xl shadow-lg border-2 border-yellow-300">
            <h3 className="text-2xl font-bold mb-4 text-yellow-700 flex items-center">
              🐌 Linear Search - O(n)
            </h3>
            <SyntaxHighlighter language="javascript" style={dark}>
{`function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i;  // Found at position i
    }
  }
  return -1;  // Not found
}

// Time: O(n) - worst case checks all elements
// Space: O(1) - constant extra space`}
            </SyntaxHighlighter>
          </div>

          <div className="p-6 rounded-xl shadow-lg border-2 border-green-300">
            <h3 className="text-2xl font-bold mb-4 text-green-700 flex items-center">
              🚀 Binary Search - O(log n)
            </h3>
            <SyntaxHighlighter language="javascript" style={dark}>
{`function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

// Time: O(log n) - halves search space each step
// Space: O(1) - constant extra space`}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>

      {/* Performance Comparison */}
      <div className="mb-12 border-t-8 border-indigo-400 p-8 shadow-lg">
        <h2 className="text-4xl font-bold mb-6 text-indigo-800">⚡ Performance at Scale</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
                <th className="p-4 text-left font-bold text-lg">📊 Input Size</th>
                <th className="p-4 text-center font-bold text-lg">O(1)</th>
                <th className="p-4 text-center font-bold text-lg">O(log n)</th>
                <th className="p-4 text-center font-bold text-lg">O(n)</th>
                <th className="p-4 text-center font-bold text-lg">O(n log n)</th>
                <th className="p-4 text-center font-bold text-lg">O(n²)</th>
                <th className="p-4 text-center font-bold text-lg">O(n³)</th>
              </tr>
            </thead>
            <tbody>
              {[10, 100, 1000, 10000, 100000].map((n, index) => (
                <tr key={n} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-indigo-50' : 'bg-white'} hover:bg-indigo-100 transition-colors`}>
                  <td className="p-4 font-mono font-bold text-indigo-800">{n.toLocaleString()}</td>
                  <td className="p-4 text-center font-mono bg-green-100 text-green-800 font-bold">1</td>
                  <td className="p-4 text-center font-mono bg-blue-100 text-blue-800 font-bold">{Math.ceil(Math.log2(n))}</td>
                  <td className="p-4 text-center font-mono bg-yellow-100 text-yellow-800 font-bold">{n.toLocaleString()}</td>
                  <td className="p-4 text-center font-mono bg-orange-100 text-orange-800 font-bold">
                    {Math.ceil(n * Math.log2(n)).toLocaleString()}
                  </td>
                  <td className="p-4 text-center font-mono bg-red-100 text-red-800 font-bold">
                    {(n * n).toLocaleString()}
                  </td>
                  <td className="p-4 text-center font-mono bg-red-200 text-red-900 font-bold">
                    {n >= 1000 ? '🔥 ∞' : (n * n * n).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-6 border-2 border-orange-300 rounded-lg" style={{ backgroundColor: '#fff3e0' }}>
          <p className="text-lg font-medium text-orange-900">
            <span className="text-2xl">💡</span> <strong>Mind-Blowing Fact:</strong> The difference between complexities becomes exponentially dramatic as input size grows.
            An O(n²) algorithm that takes 1 second for 1,000 items would take approximately <span className="font-bold text-red-600">11.5 days</span> for 1,000,000 items! 🤯
          </p>
        </div>
      </div>

      {/* Mathematical Examples */}
      <div className="mb-12 border-t-8 border-cyan-400 p-8 shadow-lg">
        <h2 className="text-4xl font-bold mb-6 text-cyan-800">🔬 Mathematical Growth Functions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Constant', formula: 'f(n) = c', complexity: 'O(1)', color: '#8884d8', emoji: '🟢' },
            { name: 'Logarithmic', formula: 'f(n) = \\log_2 n', complexity: 'O(log n)', color: '#82ca9d', emoji: '🔵' },
            { name: 'Linear', formula: 'f(n) = n', complexity: 'O(n)', color: '#ffc658', emoji: '🟡' },
            { name: 'Linearithmic', formula: 'f(n) = n \\log_2 n', complexity: 'O(n log n)', color: '#ff7300', emoji: '🟠' },
            { name: 'Quadratic', formula: 'f(n) = n^2', complexity: 'O(n²)', color: '#ff8042', emoji: '🔴' },
            { name: 'Cubic', formula: 'f(n) = n^3', complexity: 'O(n³)', color: '#ff4444', emoji: '🔥' },
          ].map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border-3 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{
                borderColor: item.color
              }}
            >
              <div className="text-3xl mb-3">{item.emoji}</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: item.color }}>
                {item.name}
              </h3>
              <div className="mb-4 text-lg">
                <Latex>{`$${item.formula}$`}</Latex>
              </div>
              <div
                className="font-mono text-lg font-bold px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: item.color }}
              >
                {item.complexity}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TestComponent;