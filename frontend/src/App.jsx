import { useState } from "react";
import { Analytics } from '@vercel/analytics/react';
import ProjectsPage from "@/pages/ProjectsPage";
import DatabaseSelectPage from "@/pages/DatabaseSelectPage";
import ShowScriptPage from "@/pages/ShowScriptPage";
import UploadMetadataPage from "@/pages/UploadMetadataPage";
import ErdVisualizerPage from "@/pages/ErdVisualizerPage";
import { projectAPI } from "@/services/api";

export default function App() {
  const [step, setStep] = useState(0); // Start with projects page
  const [selectedDb, setSelectedDb] = useState("");
  const [metadata, setMetadata] = useState("");
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [loadedProject, setLoadedProject] = useState(null);
  const [creatingProject, setCreatingProject] = useState(false);

  const handleCreateNew = () => {
    setStep(1);
    setCurrentProjectId(null);
    setProjectName("");
    setLoadedProject(null);
  };

  const handleLoadProject = (projectId) => {
    setCurrentProjectId(projectId);
    setStep(4); // Go directly to ERD viewer
  };

  const handleBackToProjects = () => {
    setStep(0);
    setCurrentProjectId(null);
    setProjectName("");
    setLoadedProject(null);
    setSelectedDb("");
    setMetadata("");
  };

  const handleCreateProject = async () => {
    if (!projectName.trim() || !selectedDb) {
      return;
    }

    try {
      setCreatingProject(true);
      const response = await projectAPI.createProject(projectName.trim(), selectedDb);
      setCurrentProjectId(response.project.id);
      setStep(2);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project: ' + error.message);
    } finally {
      setCreatingProject(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-4">
      <h1 className="text-4xl font-bold text-purple-700 mb-8">Database ERD Visualizer</h1>
      
      {step === 0 && (
        <ProjectsPage
          onCreateNew={handleCreateNew}
          onLoadProject={handleLoadProject}
        />
      )}
      
      {step === 1 && (
        <DatabaseSelectPage
          selectedDb={selectedDb}
          setSelectedDb={setSelectedDb}
          projectName={projectName}
          setProjectName={setProjectName}
          onNext={handleCreateProject}
          onBack={handleBackToProjects}
          creatingProject={creatingProject}
        />
      )}
      
      {step === 2 && (
        <ShowScriptPage
          selectedDb={selectedDb}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}
      
      {step === 3 && (
        <UploadMetadataPage
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
          onFileLoaded={setMetadata}
        />
      )}
      
      {step === 4 && (
        <ErdVisualizerPage
          metadata={metadata}
          projectId={currentProjectId}
          projectName={projectName}
          loadedProject={loadedProject}
          setLoadedProject={setLoadedProject}
          onBack={currentProjectId ? handleBackToProjects : () => setStep(3)}
        />
      )}
      
      <Analytics />
    </div>
  );
} 