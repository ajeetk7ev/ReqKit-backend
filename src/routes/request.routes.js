import { Router } from 'express';
import { RequestController } from '../controllers/request.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Protect all request routes with JWT/Cookie authentication guard
router.use(authenticate);

// Live Proxy Execution Route (Runner Engine)
router.post('/execute', RequestController.executeRequest);

// Request Endpoints Specification Routes
router.post('/', RequestController.createRequest);
router.get('/collection/:collectionId', RequestController.getCollectionRequests);
router.get('/:id', RequestController.getRequestDetails);
router.put('/:id', RequestController.updateRequest);
router.delete('/:id', RequestController.deleteRequest);

// Saved Response Examples Routes
router.post('/:id/examples', RequestController.saveResponseExample);
router.get('/:id/examples', RequestController.getRequestExamples);
router.delete('/:id/examples/:exampleId', RequestController.deleteResponseExample);

export default router;
