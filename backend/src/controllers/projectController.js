const Project = require('../models/Project');
const Diagram = require('../models/Diagram');

const projectController = {
  // Create a new project
  createProject: async (req, res) => {
    try {
      const { name, databaseType } = req.body;
      const sessionId = req.session.id;
      
      if (!name || !databaseType) {
        return res.status(400).json({ 
          error: 'Project name and database type are required' 
        });
      }
      
      if (name.length < 3 || name.length > 50) {
        return res.status(400).json({ 
          error: 'Project name must be between 3 and 50 characters' 
        });
      }
      
      const project = Project.createForSession(sessionId, name, databaseType);
      
      res.status(201).json({
        message: 'Project created successfully',
        project
      });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  },
  
  // Get all projects for the current session
  getAllProjects: async (req, res) => {
    try {
      const sessionId = req.session.id;
      const projects = Project.getAllBySession(sessionId);
      
      // Add days until expiry for each project
      const projectsWithExpiry = projects.map(project => {
        const lastAccessed = new Date(project.last_accessed_at);
        const thirtyDaysFromLastAccess = new Date(lastAccessed);
        thirtyDaysFromLastAccess.setDate(thirtyDaysFromLastAccess.getDate() + 30);
        
        const now = new Date();
        const daysUntilExpiry = Math.ceil((thirtyDaysFromLastAccess - now) / (1000 * 60 * 60 * 24));
        
        return {
          ...project,
          daysUntilExpiry: Math.max(0, daysUntilExpiry)
        };
      });
      
      res.json({ projects: projectsWithExpiry });
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  },
  
  // Get a specific project with its diagram
  getProject: async (req, res) => {
    try {
      const { id } = req.params;
      const sessionId = req.session.id;
      
      const project = Project.getById(id, sessionId);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      // Update last accessed timestamp
      Project.updateLastAccessed(id);
      
      // Get associated diagram
      const diagram = Diagram.getByProjectId(id);
      
      res.json({
        project,
        diagram
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  },
  
  // Update a project
  updateProject: async (req, res) => {
    try {
      const { id } = req.params;
      const sessionId = req.session.id;
      const updates = req.body;
      
      const updatedProject = Project.update(id, sessionId, updates);
      
      if (!updatedProject) {
        return res.status(404).json({ error: 'Project not found or access denied' });
      }
      
      res.json({
        message: 'Project updated successfully',
        project: updatedProject
      });
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ error: 'Failed to update project' });
    }
  },
  
  // Delete a project
  deleteProject: async (req, res) => {
    try {
      const { id } = req.params;
      const sessionId = req.session.id;
      
      const deleted = Project.deleteById(id, sessionId);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Project not found or access denied' });
      }
      
      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  },
  
  // Export project as JSON
  exportProject: async (req, res) => {
    try {
      const { id } = req.params;
      const sessionId = req.session.id;
      
      const project = Project.getById(id, sessionId);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const diagram = Diagram.getByProjectId(id);
      
      const exportData = {
        project: {
          name: project.name,
          database_type: project.database_type,
          created_at: project.created_at
        },
        diagram: diagram ? {
          metadata: diagram.metadata,
          nodes: diagram.nodes,
          edges: diagram.edges
        } : null
      };
      
      res.json(exportData);
    } catch (error) {
      console.error('Error exporting project:', error);
      res.status(500).json({ error: 'Failed to export project' });
    }
  },
  
  // Import project from JSON
  importProject: async (req, res) => {
    try {
      const { project: projectData, diagram: diagramData } = req.body;
      const sessionId = req.session.id;
      
      if (!projectData || !projectData.name || !projectData.database_type) {
        return res.status(400).json({ 
          error: 'Invalid project data. Name and database_type are required.' 
        });
      }
      
      // Create new project
      const project = Project.createForSession(
        sessionId, 
        projectData.name, 
        projectData.database_type
      );
      
      // Import diagram if provided
      if (diagramData && diagramData.metadata && diagramData.nodes && diagramData.edges) {
        Diagram.save(
          project.id,
          diagramData.metadata,
          diagramData.nodes,
          diagramData.edges
        );
      }
      
      res.status(201).json({
        message: 'Project imported successfully',
        project
      });
    } catch (error) {
      console.error('Error importing project:', error);
      res.status(500).json({ error: 'Failed to import project' });
    }
  }
};

module.exports = projectController;

