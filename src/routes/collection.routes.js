import { Router } from 'express';
import { CollectionController } from '../controllers/collection.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Protect all collection routes with JWT/Cookie authentication guard
router.use(authenticate);

router.post('/', CollectionController.createCollection);
router.get('/workspace/:workspaceId', CollectionController.getWorkspaceCollections);
router.get('/:id', CollectionController.getCollectionDetails);
router.put('/:id', CollectionController.updateCollection);
router.delete('/:id', CollectionController.deleteCollection);

// Sub-collection Folders Routes
router.post('/:id/folders', CollectionController.createFolder);
router.put('/:id/folders/:folderId', CollectionController.updateFolder);
router.delete('/:id/folders/:folderId', CollectionController.deleteFolder);

export default router;
