import { Router } from "express";
import {
  createSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getTasksById,
  getTasks,
  updateSubTask,
  updateTask,
} from "../controllers/task.controllers.js";
import { verifyJWT, validateProjectPermission } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constant.js";

const router = Router();
router.use(verifyJWT);

const privilegedRoles = [UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN];

// Tasks on a project
router
  .route("/:projectId")
  .get(validateProjectPermission(AvailableUserRole), getTasks)
  .post(
    validateProjectPermission(privilegedRoles),
    upload.array("attachments", 5),
    createTask
  );

// Individual task routes
router
  .route("/:projectId/t/:taskId")
  .get(validateProjectPermission(AvailableUserRole), getTasksById)
  .put(
    validateProjectPermission(privilegedRoles),
    upload.array("attachments", 5),
    updateTask
  )
  .delete(validateProjectPermission(privilegedRoles), deleteTask);

// Subtasks routes
router
  .route("/:projectId/t/:taskId/subtasks")
  .post(validateProjectPermission(privilegedRoles), createSubTask);

router
  .route("/:projectId/st/:subTaskId")
  .put(validateProjectPermission(AvailableUserRole), updateSubTask)
  .delete(validateProjectPermission(privilegedRoles), deleteSubTask);

export default router;
