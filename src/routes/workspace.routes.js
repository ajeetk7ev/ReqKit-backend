import { Router } from 'express';
import { WorkspaceController } from '../controllers/workspace.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Protect all workspace routes with JWT/Cookie authentication guard
router.use(authenticate);

router.post('/', WorkspaceController.createWorkspace);
router.get('/', WorkspaceController.getUserWorkspaces);
router.get('/:id', WorkspaceController.getWorkspaceDetails);
router.put('/:id', WorkspaceController.updateWorkspace);
router.delete('/:id', WorkspaceController.deleteWorkspace);

// Team Members Management Routes
router.post('/:id/members', WorkspaceController.addMember);
router.patch('/:id/members/:userId', WorkspaceController.updateMemberRole);
router.delete('/:id/members/:userId', WorkspaceController.removeMember);

export default router;
