const Diagram = require('../models/Diagram');
const Project = require('../models/Project');

const diagramController = {
  // Save diagram for a project
  saveDiagram: async (req, res) => {
    try {
      const { projectId } = req.params;
      const { metadata, nodes, edges } = req.body;
      const sessionId = req.session.id;
      
      // Verify project ownership
      const project = Project.getById(projectId, sessionId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found or access denied' });
      }
      
      if (!metadata || !nodes || !edges) {
        return res.status(400).json({ 
          error: 'Metadata, nodes, and edges are required' 
        });
      }
      
      // Save diagram
      const diagram = Diagram.save(projectId, metadata, nodes, edges);
      
      // Update project's last accessed timestamp
      Project.updateLastAccessed(projectId);
      
      res.json({
        message: 'Diagram saved successfully',
        diagram
      });
    } catch (error) {
      console.error('Error saving diagram:', error);
      res.status(500).json({ error: 'Failed to save diagram' });
    }
  },
  
  // Get diagram for a project
  getDiagram: async (req, res) => {
    try {
      const { projectId } = req.params;
      const sessionId = req.session.id;
      
      // Verify project ownership
      const project = Project.getById(projectId, sessionId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found or access denied' });
      }
      
      // Get diagram
      const diagram = Diagram.getByProjectId(projectId);
      
      if (!diagram) {
        return res.status(404).json({ error: 'Diagram not found' });
      }
      
      // Update project's last accessed timestamp
      Project.updateLastAccessed(projectId);
      
      res.json({ diagram });
    } catch (error) {
      console.error('Error fetching diagram:', error);
      res.status(500).json({ error: 'Failed to fetch diagram' });
    }
  }
};

module.exports = diagramController;
