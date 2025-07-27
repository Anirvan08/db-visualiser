import { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState,
  addEdge
} from "reactflow";
import "reactflow/dist/style.css";
import TableNode from "@/components/TableNode";
import { parseMetadataToErd } from "@/utils/metadataParser";

const nodeTypes = { tableNode: TableNode };

export default function ErdVisualizerPage({ metadata, onBack }) {
  const { nodes: initialNodes, edges: initialEdges } = parseMetadataToErd(metadata);
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Use ReactFlow's state hooks for managing nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialNodes.map(node => ({
      ...node,
      draggable: true, // Make all nodes draggable
    }))
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Debug: Log what we're getting
  console.log('Parsed metadata:', { nodes, edges });

  // Handle new connections (optional)
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node drag (optional - for custom logic)
  const onNodeDrag = useCallback((event, node) => {
    console.log('Node being dragged:', node.id, node.position);
  }, []);

  // Handle node drag stop (optional - for custom logic)
  const onNodeDragStop = useCallback((event, node) => {
    console.log('Node drag stopped:', node.id, node.position);
  }, []);

  // Handle node click for highlighting
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(selectedNode === node.id ? null : node.id);
  }, [selectedNode]);

  // Handle pane click to clear selection
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Apply highlighting to nodes and edges
  const highlightedNodes = nodes.map(node => ({
    ...node,
    style: {
      ...node.style,
      opacity: selectedNode ? (selectedNode === node.id ? 1 : 0.3) : 1,
      filter: selectedNode ? (selectedNode === node.id ? 'drop-shadow(0 0 10px rgba(37, 99, 235, 0.5))' : 'none') : 'none',
    }
  }));

  const highlightedEdges = edges.map(edge => ({
    ...edge,
    style: {
      ...edge.style,
      opacity: selectedNode ? 
        (edge.source === selectedNode || edge.target === selectedNode ? 1 : 0.2) : 1,
      strokeWidth: selectedNode ? 
        (edge.source === selectedNode || edge.target === selectedNode ? 3 : 1) : 2,
    }
  }));

  // Fit view on mount with better options for complex diagrams
  const onInit = useCallback((instance) => {
    instance.fitView({ 
      padding: 0.1,
      includeHiddenNodes: false,
      minZoom: 0.1,
      maxZoom: 1.5
    });
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-50">
      {/* Floating Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
        <h1 className="text-2xl font-bold text-gray-800">Database ERD Visualization</h1>
        <div className="flex items-center gap-4">
          {selectedNode && (
            <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
              Selected: <span className="font-semibold">{selectedNode}</span>
            </div>
          )}
          <Button variant="secondary" onClick={onBack} className="shadow-sm">
            ← Back to Upload
          </Button>
        </div>
      </div>

      {/* Full Screen React Flow */}
      <div className="w-full h-full">
        <ReactFlow
          nodes={highlightedNodes}
          edges={highlightedEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          onInit={onInit}
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { 
              stroke: '#2563eb', 
              strokeWidth: 2,
              strokeDasharray: '5,5'
            },
            animated: true,
            markerEnd: {
              type: 'arrowclosed',
              width: 20,
              height: 20,
              color: '#2563eb'
            }
          }}
          minZoom={0.1}
          maxZoom={1.5}
          fitViewOptions={{
            padding: 0.1,
            includeHiddenNodes: false
          }}
        >
          <Background />
          <Controls className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg" />
        </ReactFlow>
      </div>
    </div>
  );
}