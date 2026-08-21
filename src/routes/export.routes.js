import { Router } from 'express';
import { ExportController } from '../controllers/export.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Protect all export routes with JWT/Cookie authentication guard
router.use(authenticate);

// Export Single Request
router.get('/request/:requestId', ExportController.exportRequest);

// Export Sub-Collection / Folder
router.get('/collection/:collectionId/folder/:folderId', ExportController.exportFolder);

// Export Complete Collection
router.get('/collection/:collectionId', ExportController.exportCollection);

export default router;
