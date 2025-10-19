import { useCallback, useState, useEffect, useRef } from "react";
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
import { diagramAPI, projectAPI } from "@/services/api";

const nodeTypes = { tableNode: TableNode };

export default function ErdVisualizerPage({ 
  metadata, 
  projectId, 
  projectName, 
  loadedProject, 
  setLoadedProject, 
  onBack 
}) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [saveStatus, setSaveStatus] = useState(""); // "", "saving", "saved", "error"
  const [projectData, setProjectData] = useState(null);
  const autoSaveTimeoutRef = useRef(null);
  
  // Determine initial nodes and edges
  const getInitialData = () => {
    if (loadedProject && loadedProject.diagram) {
      // Load from existing project
      return {
        nodes: loadedProject.diagram.nodes.map(node => ({
          ...node,
          draggable: true,
        })),
        edges: loadedProject.diagram.edges
      };
    } else {
      // Parse from metadata (new project)
      const { nodes: initialNodes, edges: initialEdges } = parseMetadataToErd(metadata);
      return {
        nodes: initialNodes.map(node => ({
          ...node,
          draggable: true,
        })),
        edges: initialEdges
      };
    }
  };

  const initialData = getInitialData();
  
  // Use ReactFlow's state hooks for managing nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData.edges);

  // Load project data on mount if projectId exists
  useEffect(() => {
    if (projectId && !loadedProject) {
      loadProject();
    }
  }, [projectId]);

  // Auto-save new projects after initial render
  useEffect(() => {
    if (projectId && !loadedProject && nodes.length > 0) {
      // Auto-save new project after a short delay
      const timer = setTimeout(() => {
        saveDiagram(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [projectId, loadedProject, nodes.length]);

  const loadProject = async () => {
    try {
      const response = await projectAPI.getProject(projectId);
      setProjectData(response.project);
      setLoadedProject(response);
    } catch (error) {
      console.error('Error loading project:', error);
      setSaveStatus("error");
    }
  };

  const saveDiagram = async (showStatus = true) => {
    if (!projectId) return;

    try {
      if (showStatus) setSaveStatus("saving");
      
      await diagramAPI.saveDiagram(projectId, metadata, nodes, edges);
      
      if (showStatus) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus(""), 2000);
      }
    } catch (error) {
      console.error('Error saving diagram:', error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  const debouncedAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveDiagram(false); // Auto-save without showing status
    }, 2000);
  }, [nodes, edges, metadata, projectId]);

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
    // Trigger auto-save after node drag
    debouncedAutoSave();
  }, [debouncedAutoSave]);

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
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {projectData?.name || projectName || "Database ERD Visualization"}
          </h1>
          {projectId && (
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => saveDiagram(true)}
                disabled={saveStatus === "saving"}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                {saveStatus === "saving" ? "⏳ Saving..." : "💾 Save"}
              </Button>
              {saveStatus === "saved" && (
                <span className="text-green-600 text-sm">✓ Saved</span>
              )}
              {saveStatus === "error" && (
                <span className="text-red-600 text-sm">✗ Error</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {selectedNode && (
            <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
              Selected: <span className="font-semibold">{selectedNode}</span>
            </div>
          )}
          <Button variant="secondary" onClick={onBack} className="shadow-sm">
            ← Back to {projectId ? "Projects" : "Upload"}
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