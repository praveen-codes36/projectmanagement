import { Router } from 'express';
import {
  createNote,
  deleteNote,
  getNoteById,
  getNotes,
  updateNote,
} from '../controllers/note.controller';
import { verifyJWT, validateProjectPermission } from '../middlewares/auth.middleware';
import { AvailableUserRole, UserRolesEnum } from '../utils/constants';

const router = Router();
router.use(verifyJWT);

router
  .route('/:projectId')
  .get(validateProjectPermission(AvailableUserRole), getNotes)
  .post(validateProjectPermission(AvailableUserRole), createNote);

router
  .route('/:projectId/n/:noteId')
  .get(validateProjectPermission(AvailableUserRole), getNoteById)
  .put(validateProjectPermission(AvailableUserRole), updateNote)
  .delete(validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]), deleteNote);

export default router;
