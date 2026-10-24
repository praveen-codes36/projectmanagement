import { Router } from "express";
import { verifyJWT, validateProjectPermission } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constant.js";
import {
    getTasks,
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    createSubTask,
    updateSubTask,
    deleteSubTask,
} from "../controllers/task.controllers.js";

const router = Router();

router.use(verifyJWT);

router
    .route("/:projectId")
    .get(validateProjectPermission(AvailableUserRoles), getTasks)
    .post(
        validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        upload.array("attachments",5),
        createTask,
    );

router
    .route("/:projectId/t/:taskId")
    .get(validateProjectPermission(AvailableUserRoles), getTaskById)
    .put(
        validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        upload.array("attachments",5),
        updateTask,
    )
    .delete(
        validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        deleteTask,
    );

router
    .route("/:projectId/t/:taskId/subtasks")
    .post(
        validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        createSubTask,
    );

router
    .route("/:projectId/st/:subTaskId")
    .put(validateProjectPermission(AvailableUserRoles), updateSubTask)
    .delete(
        validateProjectPermission([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
        deleteSubTask,
    );

export default router;