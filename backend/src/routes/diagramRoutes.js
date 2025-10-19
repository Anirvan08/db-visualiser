const express = require('express');
const router = express.Router();
const diagramController = require('../controllers/diagramController');

// Save diagram for a project
router.post('/:projectId/diagram', diagramController.saveDiagram);

// Get diagram for a project
router.get('/:projectId/diagram', diagramController.getDiagram);

module.exports = router;

