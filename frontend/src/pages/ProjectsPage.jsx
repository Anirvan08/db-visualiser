import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { projectAPI, downloadJSON, readJSONFile } from "@/services/api";

const DATABASE_ICONS = {
  postgres: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
  mysql: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
  sqlite: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg",
};

export default function ProjectsPage({ onCreateNew, onLoadProject }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [exportingId, setExportingId] = useState(null);

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectAPI.getAllProjects();
      setProjects(response.projects || []);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (!window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(projectId);
      await projectAPI.deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportProject = async (projectId, projectName) => {
    try {
      setExportingId(projectId);
      const exportData = await projectAPI.exportProject(projectId);
      const filename = `${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.json`;
      downloadJSON(exportData, filename);
    } catch (err) {
      console.error('Error exporting project:', err);
      alert('Failed to export project: ' + err.message);
    } finally {
      setExportingId(null);
    }
  };

  const handleImportProject = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const importData = await readJSONFile(file);
      await projectAPI.importProject(importData);
      await loadProjects(); // Refresh the projects list
      alert('Project imported successfully!');
    } catch (err) {
      console.error('Error importing project:', err);
      alert('Failed to import project: ' + err.message);
    } finally {
      // Reset file input
      event.target.value = '';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getExpiryColor = (daysUntilExpiry) => {
    if (daysUntilExpiry <= 3) return 'text-red-600';
    if (daysUntilExpiry <= 7) return 'text-orange-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your projects...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading projects: {error}</p>
            <Button onClick={loadProjects} variant="secondary">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Your ERD Projects</CardTitle>
          <div className="flex justify-center gap-4 mt-4">
            <Button onClick={onCreateNew} className="bg-purple-600 hover:bg-purple-700">
              + Create New Project
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportProject}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="import-file"
              />
              <Button variant="outline" className="cursor-pointer">
                📁 Import Project
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-6">Create your first ERD project to get started!</p>
              <Button onClick={onCreateNew} className="bg-purple-600 hover:bg-purple-700">
                Create Your First Project
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={DATABASE_ICONS[project.database_type]} 
                      alt={project.database_type}
                      className="w-8 h-8"
                    />
                    <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                  </div>
                  <div className={`text-sm font-medium ${getExpiryColor(project.daysUntilExpiry)}`}>
                    {project.daysUntilExpiry}d left
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Database:</strong> {project.database_type.toUpperCase()}</p>
                  <p><strong>Created:</strong> {formatDate(project.created_at)}</p>
                  <p><strong>Last accessed:</strong> {formatDate(project.last_accessed_at)}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => onLoadProject(project.id)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    size="sm"
                  >
                    Open
                  </Button>
                  <Button 
                    onClick={() => handleExportProject(project.id, project.name)}
                    disabled={exportingId === project.id}
                    variant="outline"
                    size="sm"
                  >
                    {exportingId === project.id ? '⏳' : '📤'}
                  </Button>
                  <Button 
                    onClick={() => handleDeleteProject(project.id, project.name)}
                    disabled={deletingId === project.id}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingId === project.id ? '⏳' : '🗑️'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 text-xl">ℹ️</div>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">How it works:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Projects are automatically saved to your browser session</li>
                <li>• Inactive projects are deleted after 30 days</li>
                <li>• Use Export/Import to backup or share your projects</li>
                <li>• Each project can contain multiple ERD diagrams</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

