import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { uploadDocument } from '../middleware/upload.js';
import {
  createDocument,
  updateDocument,
  deleteDocument,
  reorderDocuments,
  listDocumentsByLessonAdmin,
} from '../controllers/adminDocumentController.js';

const router = Router();

router.use(requireAuth, requireAdmin);

// Nested dưới /api/admin/lessons/:lessonId/documents — mount riêng trong app.js
export const lessonDocumentsRouter = Router({ mergeParams: true });
lessonDocumentsRouter.post('/', uploadDocument.single('file'), createDocument);
lessonDocumentsRouter.get('/', listDocumentsByLessonAdmin);

const root = Router();
root.put('/:id', updateDocument);
root.delete('/:id', deleteDocument);
root.post('/reorder', reorderDocuments);

export default root;