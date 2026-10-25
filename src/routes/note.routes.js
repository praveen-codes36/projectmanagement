import { Router } from "express";
import { verifyJWT, validateProjectPermission } from "../middlewares/auth.middleware.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constant.js";
import {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
} from "../controllers/note.controller.js";

const router = Router();

router.use(verifyJWT);

router
    .route("/:projectId")
    .get(validateProjectPermission(AvailableUserRole), getNotes)
    .post(validateProjectPermission([UserRolesEnum.ADMIN]), createNote);

router
    .route("/:projectId/n/:noteId")
    .get(validateProjectPermission(AvailableUserRole), getNoteById)
    .put(validateProjectPermission([UserRolesEnum.ADMIN]), updateNote)
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteNote);

export default router;