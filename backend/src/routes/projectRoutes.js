const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// Create a new project
router.post('/', projectController.createProject);

// Get all projects for the current session
router.get('/', projectController.getAllProjects);

// Get a specific project with its diagram
router.get('/:id', projectController.getProject);

// Update a project
router.put('/:id', projectController.updateProject);

// Delete a project
router.delete('/:id', projectController.deleteProject);

// Export project as JSON
router.post('/:id/export', projectController.exportProject);

// Import project from JSON
router.post('/import', projectController.importProject);

module.exports = router;

