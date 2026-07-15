import { useState, useEffect } from "react";
import { Analytics } from '@vercel/analytics/react';
import ProjectsPage from "@/pages/ProjectsPage";
import DatabaseSelectPage from "@/pages/DatabaseSelectPage";
import ShowScriptPage from "@/pages/ShowScriptPage";
import UploadMetadataPage from "@/pages/UploadMetadataPage";
import ErdVisualizerPage from "@/pages/ErdVisualizerPage";
import LoginPage from "@/pages/LoginPage";
import UserProfile from "@/components/UserProfile";
import { projectAPI } from "@/services/api";
import { authAPI } from "@/services/auth";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(0); // Start with projects page
  const [selectedDb, setSelectedDb] = useState("");
  const [metadata, setMetadata] = useState("");
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [loadedProject, setLoadedProject] = useState(null);
  const [creatingProject, setCreatingProject] = useState(false);

  // Check authentication on mount and after login redirect
  useEffect(() => {
    checkAuthentication();
    
    // Check if we're returning from OAuth login
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'success') {
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      checkAuthentication();
    }
  }, []);

  const checkAuthentication = async () => {
    try {
      setAuthLoading(true);
      const response = await authAPI.getCurrentUser();
      if (response.authenticated) {
        setIsAuthenticated(true);
        setUser(response.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      // Clear API auth cache to force refresh
      if (window.clearAuthCache) {
        window.clearAuthCache();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

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

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show main app for both authenticated and guest users
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-purple-200">
      {/* Header with user profile */}
      <header className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-purple-700">Database ERD Visualizer</h1>
          <UserProfile />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
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
      </div>
      
      <Analytics />
    </div>
  );
} 