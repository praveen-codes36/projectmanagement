import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { Subtask } from '../models/Subtask';
import { ApiResponse } from '../utils/api-response';
import { ApiError } from '../utils/api-error';
import { asyncHandler } from '../utils/async-handler';
import { AvailableTaskStatuses, TaskStatusEnum } from '../utils/constants';

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, 'Invalid project id');
  }

  const pId = new mongoose.Types.ObjectId(projectId);
  const tasks = await Task.find({ project: pId })
    .populate('assignedTo', '_id username fullName avatar email')
    .lean();

  const taskIds = tasks.map((t) => t._id);
  const subtasks = await Subtask.find({ task: { $in: taskIds } }).lean();

  const subtaskMap = new Map<string, any[]>();
  subtasks.forEach((st) => {
    const tId = String(st.task);
    if (!subtaskMap.has(tId)) subtaskMap.set(tId, []);
    subtaskMap.get(tId)!.push(st);
  });

  const enrichedTasks = tasks.map((t) => ({
    ...t,
    subtasks: subtaskMap.get(String(t._id)) || [],
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, enrichedTasks, 'Tasks fetched successfully'));
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, assignedTo, status } = req.body;
  const { projectId } = req.params;

  if (!title || !title.trim()) {
    throw new ApiError(400, 'Task title is required');
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, 'Invalid project id');
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const files = (req.files as Express.Multer.File[]) || [];
  const serverUrl = process.env.SERVER_URL || '';

  const attachments = files.map((file) => ({
    url: `${serverUrl}/images/${file.filename}`,
    mimetype: file.mimetype,
    size: file.size,
    originalname: file.originalname,
  }));

  let assignedToId: mongoose.Types.ObjectId | undefined;
  if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
    assignedToId = new mongoose.Types.ObjectId(assignedTo);
  }

  const taskStatus = AvailableTaskStatuses.includes(status) ? status : TaskStatusEnum.TODO;

  const task = await Task.create({
    title: title.trim(),
    description: description ? description.trim() : '',
    project: new mongoose.Types.ObjectId(projectId),
    assignedTo: assignedToId,
    assignedBy: req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : undefined,
    status: taskStatus,
    attachments,
  });

  const populatedTask = await Task.findById(task._id)
    .populate('assignedTo', '_id username fullName avatar email')
    .lean();

  return res.status(201).json(
    new ApiResponse(
      201,
      { ...populatedTask, subtasks: [] },
      'Task created successfully'
    )
  );
});

export const getTasksById = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, 'Invalid task id');
  }

  const task = await Task.findById(taskId)
    .populate('assignedTo', '_id username fullName avatar email')
    .lean();

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  const subtasks = await Subtask.find({ task: new mongoose.Types.ObjectId(taskId) }).lean();

  return res.status(200).json(
    new ApiResponse(200, { ...task, subtasks }, 'Task fetched successfully')
  );
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { title, description, assignedTo, status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, 'Invalid task id');
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  if (title !== undefined && title.trim()) {
    task.title = title.trim();
  }

  if (description !== undefined) {
    task.description = description.trim();
  }

  if (assignedTo !== undefined) {
    if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
      task.assignedTo = new mongoose.Types.ObjectId(assignedTo);
    } else {
      task.assignedTo = undefined;
    }
  }

  if (status && AvailableTaskStatuses.includes(status)) {
    task.status = status;
  }

  const files = (req.files as Express.Multer.File[]) || [];
  if (files.length > 0) {
    const serverUrl = process.env.SERVER_URL || '';
    const newAttachments = files.map((file) => ({
      url: `${serverUrl}/images/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
      originalname: file.originalname,
    }));
    task.attachments = [...(task.attachments || []), ...newAttachments];
  }

  await task.save();

  const updatedTask = await Task.findById(taskId)
    .populate('assignedTo', '_id username fullName avatar email')
    .lean();

  const subtasks = await Subtask.find({ task: new mongoose.Types.ObjectId(taskId) }).lean();

  return res.status(200).json(
    new ApiResponse(200, { ...updatedTask, subtasks }, 'Task updated successfully')
  );
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, 'Invalid task id');
  }

  const task = await Task.findByIdAndDelete(taskId);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  await Subtask.deleteMany({ task: new mongoose.Types.ObjectId(taskId) });

  return res
    .status(200)
    .json(new ApiResponse(200, task, 'Task deleted successfully'));
});

export const createSubTask = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { title } = req.body;

  if (!title || !title.trim()) {
    throw new ApiError(400, 'Subtask title is required');
  }

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, 'Invalid task id');
  }

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, 'Parent task not found');
  }

  const subtask = await Subtask.create({
    title: title.trim(),
    task: new mongoose.Types.ObjectId(taskId),
    isCompleted: false,
    createdBy: new mongoose.Types.ObjectId(req.user?._id),
  });

  return res.status(201).json(
    new ApiResponse(201, subtask, 'Subtask created successfully')
  );
});

export const updateSubTask = asyncHandler(async (req: Request, res: Response) => {
  const { subTaskId } = req.params;
  const { title, isCompleted } = req.body;

  if (!mongoose.Types.ObjectId.isValid(subTaskId)) {
    throw new ApiError(400, 'Invalid subtask id');
  }

  const subtask = await Subtask.findById(subTaskId);
  if (!subtask) {
    throw new ApiError(404, 'Subtask not found');
  }

  if (title !== undefined && title.trim()) {
    subtask.title = title.trim();
  }

  if (isCompleted !== undefined) {
    subtask.isCompleted = Boolean(isCompleted);
  }

  await subtask.save();

  return res
    .status(200)
    .json(new ApiResponse(200, subtask, 'Subtask updated successfully'));
});

export const deleteSubTask = asyncHandler(async (req: Request, res: Response) => {
  const { subTaskId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(subTaskId)) {
    throw new ApiError(400, 'Invalid subtask id');
  }

  const subtask = await Subtask.findByIdAndDelete(subTaskId);
  if (!subtask) {
    throw new ApiError(404, 'Subtask not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subtask, 'Subtask deleted successfully'));
});
