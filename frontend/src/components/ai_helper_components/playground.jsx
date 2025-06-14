// This file serves as a playground for testing ai generated components
// Plugins/Libraries available to the agent
import React from 'react'
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import Plot from 'react-plotly.js'
import * as Recharts from 'recharts';
import * as RF from '@xyflow/react';
import '@xyflow/react/dist/style.css';

function TestComponent() {
  const [selectedComplexity, setSelectedComplexity] = React.useState('all');
  const [inputSize, setInputSize] = React.useState(20);
  const [selectedAlgorithm, setSelectedAlgorithm] = React.useState('linear');

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

  // Generate 3D surface data for Plotly
  const generate3DData = () => {
    const x = [], y = [], z = [];
    for (let i = 1; i <= 20; i++) {
      x.push(i);
      y.push(i);
      z.push(i * i); // O(n²) for demonstration
    }
    return { x, y, z };
  };

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

  // ReactFlow nodes for algorithm visualization
  const algorithmFlows = {
    linear: {
      nodes: [
        { id: '1', position: { x: 50, y: 50 }, data: { label: 'Start' }, style: { background: '#e1f5fe' } },
        { id: '2', position: { x: 50, y: 150 }, data: { label: 'Check Element' }, style: { background: '#fff3e0' } },
        { id: '3', position: { x: 200, y: 150 }, data: { label: 'Found?' }, type: 'input', style: { background: '#f3e5f5' } },
        { id: '4', position: { x: 350, y: 100 }, data: { label: 'Return Index' }, style: { background: '#e8f5e8' } },
        { id: '5', position: { x: 350, y: 200 }, data: { label: 'Next Element' }, style: { background: '#fff3e0' } },
        { id: '6', position: { x: 50, y: 250 }, data: { label: 'End of Array?' }, style: { background: '#f3e5f5' } },
        { id: '7', position: { x: 200, y: 300 }, data: { label: 'Return -1' }, style: { background: '#ffebee' } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', animated: true },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4', label: 'Yes' },
        { id: 'e3-5', source: '3', target: '5', label: 'No' },
        { id: 'e5-6', source: '5', target: '6' },
        { id: 'e6-2', source: '6', target: '2', label: 'No' },
        { id: 'e6-7', source: '6', target: '7', label: 'Yes' },
      ]
    },
    binary: {
      nodes: [
        { id: '1', position: { x: 100, y: 50 }, data: { label: 'Start (Sorted Array)' }, style: { background: '#e1f5fe' } },
        { id: '2', position: { x: 100, y: 150 }, data: { label: 'Check Middle' }, style: { background: '#fff3e0' } },
        { id: '3', position: { x: 100, y: 250 }, data: { label: 'Compare with Target' }, style: { background: '#f3e5f5' } },
        { id: '4', position: { x: 250, y: 200 }, data: { label: 'Found!' }, style: { background: '#e8f5e8' } },
        { id: '5', position: { x: 20, y: 350 }, data: { label: 'Search Left Half' }, style: { background: '#fff3e0' } },
        { id: '6', position: { x: 180, y: 350 }, data: { label: 'Search Right Half' }, style: { background: '#fff3e0' } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', animated: true },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4', label: '=' },
        { id: 'e3-5', source: '3', target: '5', label: '<' },
        { id: 'e3-6', source: '3', target: '6', label: '>' },
        { id: 'e5-2', source: '5', target: '2', label: 'Repeat' },
        { id: 'e6-2', source: '6', target: '2', label: 'Repeat' },
      ]
    }
  };

  const currentFlow = algorithmFlows[selectedAlgorithm];

  // 3D plot data
  const plotData = generate3DData();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-12 border-b-4 border-blue-400 pb-8">
        <h1 className="text-6xl font-bold mb-4 text-gray-800">
          Big O Notation
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Understanding algorithm efficiency through interactive visualizations
        </p>
      </div>

      {/* Mathematical Definition */}
      <div className="mb-12 p-8 border-l-8 border-blue-400 shadow-lg">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Mathematical Definition</h2>
        <p className="text-lg mb-6 text-gray-700">
          Big O notation describes the upper bound of algorithm complexity:
        </p>
        <div className="text-center text-xl p-6 border-2 border-gray-300 rounded-lg">
          <Latex>
            {"$f(n) = O(g(n))$ if there exist positive constants $c$ and $n_0$ such that:"}
          </Latex>
          <div className="mt-4">
            <Latex>
              {"$0 \\leq f(n) \\leq c \\cdot g(n)$ for all $n \\geq n_0$"}
            </Latex>
          </div>
        </div>
      </div>

      {/* Interactive Complexity Chart */}
      <div className="mb-12 p-8 border-l-8 border-green-400 shadow-lg">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Interactive Complexity Comparison</h2>

        <div className="flex flex-wrap gap-6 mb-8">
          <div className="flex items-center gap-3">
            <label className="text-lg font-medium">Input Size (n):</label>
            <input
              type="range"
              min="10"
              max="100"
              value={inputSize}
              onChange={(e) => setInputSize(parseInt(e.target.value))}
              className="w-40"
            />
            <span className="text-lg font-mono bg-blue-100 px-3 py-1 rounded">{inputSize}</span>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-lg font-medium">Focus on:</label>
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
            <Recharts.Legend />
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(complexityInfo).map(([key, info]) => (
            <div
              key={key}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                selectedComplexity === key || selectedComplexity === 'all' 
                  ? 'shadow-md transform scale-105' 
                  : 'opacity-60'
              }`}
              onClick={() => setSelectedComplexity(selectedComplexity === key ? 'all' : key)}
              style={{
                borderColor: info.color,
                backgroundColor: `${info.color}20`
              }}
            >
              <div className="text-center">
                <div className="font-mono text-sm font-bold">{info.name}</div>
                <div className="text-xs text-gray-600 mt-1">{info.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Algorithm Flow Visualization */}
      <div className="mb-12 p-8 border-l-8 border-purple-400 shadow-lg">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Algorithm Flow Visualization</h2>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setSelectedAlgorithm('linear')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedAlgorithm === 'linear' 
                ? 'bg-purple-500 text-white' 
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            Linear Search O(n)
          </button>
          <button
            onClick={() => setSelectedAlgorithm('binary')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedAlgorithm === 'binary' 
                ? 'bg-purple-500 text-white' 
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            Binary Search O(log n)
          </button>
        </div>

        <div style={{ width: '100%', height: '400px' }} className="border-2 border-gray-300 rounded-lg">
          <RF.ReactFlow
            nodes={currentFlow.nodes}
            edges={currentFlow.edges}
            fitView
            attributionPosition="bottom-left"
          >
            <RF.Controls />
            <RF.Background variant="dots" gap={12} size={1} />
          </RF.ReactFlow>
        </div>
      </div>

      {/* 3D Complexity Visualization */}
      <div className="mb-12 p-8 border-l-8 border-red-400 shadow-lg">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">3D Complexity Surface</h2>
        <p className="text-lg mb-6 text-gray-700">
          Visualizing how O(n²) complexity grows with input size:
        </p>

        <div className="flex justify-center">
          <Plot
            data={[
              {
                x: Array.from({length: 20}, (_, i) => i + 1),
                y: Array.from({length: 20}, (_, i) => i + 1),
                z: Array.from({length: 20}, (_, i) =>
                  Array.from({length: 20}, (_, j) => (i + 1) * (j + 1))
                ),
                type: 'surface',
                colorscale: 'Viridis',
                showscale: true,
              }
            ]}
            layout={{
              width: 600,
              height: 500,
              title: {
                text: 'O(n²) Complexity Growth',
                font: { size: 18 }
              },
              scene: {
                xaxis: { title: 'Input Size X' },
                yaxis: { title: 'Input Size Y' },
                zaxis: { title: 'Operations' },
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
      <div className="mb-12 p-8 border-l-8 border-yellow-400 shadow-lg">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Algorithm Implementations</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-700">Linear Search - O(n)</h3>
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

          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-700">Binary Search - O(log n)</h3>
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

          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-700">Bubble Sort - O(n²)</h3>
            <SyntaxHighlighter language="javascript" style={dark}>
{`function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}

// Time: O(n²) - nested loops over array
// Space: O(1) - sorts in place`}
            </SyntaxHighlighter>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3 text-gray-700">Merge Sort - O(n log n)</h3>
            <SyntaxHighlighter language="javascript" style={dark}>
{`function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  let result = [], i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return result.concat(left.slice(i), right.slice(j));
}

// Time: O(n log n) - divide and conquer
// Space: O(n) - requires additional arrays`}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>

      {/* Performance Comparison */}
      <div className="mb-12 p-8 border-l-8 border-orange-400 shadow-lg">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Performance at Scale</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-400">
                <th className="p-4 text-left font-bold">Input Size</th>
                <th className="p-4 text-center font-bold">O(1)</th>
                <th className="p-4 text-center font-bold">O(log n)</th>
                <th className="p-4 text-center font-bold">O(n)</th>
                <th className="p-4 text-center font-bold">O(n log n)</th>
                <th className="p-4 text-center font-bold">O(n²)</th>
                <th className="p-4 text-center font-bold">O(n³)</th>
              </tr>
            </thead>
            <tbody>
              {[10, 100, 1000, 10000, 100000].map((n, index) => (
                <tr key={n} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                  <td className="p-4 font-mono font-bold">{n.toLocaleString()}</td>
                  <td className="p-4 text-center font-mono">1</td>
                  <td className="p-4 text-center font-mono">{Math.ceil(Math.log2(n))}</td>
                  <td className="p-4 text-center font-mono">{n.toLocaleString()}</td>
                  <td className="p-4 text-center font-mono text-blue-600">
                    {Math.ceil(n * Math.log2(n)).toLocaleString()}
                  </td>
                  <td className="p-4 text-center font-mono text-orange-600">
                    {(n * n).toLocaleString()}
                  </td>
                  <td className="p-4 text-center font-mono text-red-600">
                    {n >= 1000 ? '∞' : (n * n * n).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-6 border-2 border-orange-300 rounded-lg" style={{ backgroundColor: '#fff3e0' }}>
          <p className="text-base">
            <strong>💡 Key Insight:</strong> The difference between complexities becomes exponentially dramatic as input size grows.
            An O(n²) algorithm that takes 1 second for 1,000 items would take approximately 11.5 days for 1,000,000 items!
          </p>
        </div>
      </div>

      {/* Mathematical Examples */}
      <div className="mb-12 p-8 border-l-8 border-indigo-400 shadow-lg">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Mathematical Growth Functions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Constant', formula: 'f(n) = c', complexity: 'O(1)', color: '#8884d8' },
            { name: 'Logarithmic', formula: 'f(n) = \\log_2 n', complexity: 'O(log n)', color: '#82ca9d' },
            { name: 'Linear', formula: 'f(n) = n', complexity: 'O(n)', color: '#ffc658' },
            { name: 'Linearithmic', formula: 'f(n) = n \\log_2 n', complexity: 'O(n log n)', color: '#ff7300' },
            { name: 'Quadratic', formula: 'f(n) = n^2', complexity: 'O(n²)', color: '#ff8042' },
            { name: 'Cubic', formula: 'f(n) = n^3', complexity: 'O(n³)', color: '#ff4444' },
          ].map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border-2 text-center"
              style={{
                borderColor: item.color,
                backgroundColor: `${item.color}15`
              }}
            >
              <h3 className="text-lg font-bold mb-3" style={{ color: item.color }}>
                {item.name}
              </h3>
              <div className="mb-3">
                <Latex>{`$${item.formula}$`}</Latex>
              </div>
              <div className="font-mono text-sm font-bold">{item.complexity}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TestComponent;