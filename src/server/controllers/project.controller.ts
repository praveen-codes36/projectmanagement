import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Project } from '../models/Project';
import { ProjectMember } from '../models/ProjectMember';
import { Task } from '../models/Task';
import { Subtask } from '../models/Subtask';
import { ProjectNote } from '../models/ProjectNote';
import { User } from '../models/User';
import { ApiResponse } from '../utils/api-response';
import { ApiError } from '../utils/api-error';
import { asyncHandler } from '../utils/async-handler';
import { AvailableUserRole, UserRolesEnum } from '../utils/constants';

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  // Find all memberships for this user
  const memberships = await ProjectMember.find({
    user: new mongoose.Types.ObjectId(userId),
  }).lean();

  if (memberships.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], 'Projects fetched successfully'));
  }

  const projectIds = memberships.map((m) => m.project);
  const projects = await Project.find({ _id: { $in: projectIds } }).lean();

  // Get member counts for each project
  const memberCounts = await ProjectMember.aggregate([
    { $match: { project: { $in: projectIds } } },
    { $group: { _id: '$project', count: { $sum: 1 } } },
  ]);

  const countMap = new Map<string, number>();
  memberCounts.forEach((mc) => countMap.set(String(mc._id), mc.count));

  const roleMap = new Map<string, string>();
  memberships.forEach((m) => roleMap.set(String(m.project), m.role));

  const result = projects.map((p) => {
    const pIdStr = String(p._id);
    return {
      project: {
        _id: p._id,
        name: p.name,
        description: p.description || '',
        members: countMap.get(pIdStr) || 1,
        memberCount: countMap.get(pIdStr) || 1,
        createdAt: p.createdAt,
        createdBy: p.createdBy,
      },
      role: roleMap.get(pIdStr) || UserRolesEnum.MEMBER,
      _id: p._id,
    };
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Projects fetched successfully'));
});

export const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, 'Invalid project id');
  }

  const project = await Project.findById(projectId).lean();

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const memberCount = await ProjectMember.countDocuments({
    project: new mongoose.Types.ObjectId(projectId),
  });

  const membership = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(req.user?._id),
  }).lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...project,
        memberCount,
        currentUserRole: membership?.role || UserRolesEnum.MEMBER,
      },
      'Project fetched successfully'
    )
  );
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const { name, description } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, 'Project name is required');
  }

  if (!req.user?._id) {
    throw new ApiError(401, 'Unauthorized');
  }

  const existing = await Project.findOne({ name: name.trim() });
  if (existing) {
    throw new ApiError(409, 'A project with this name already exists');
  }

  const newProject = await Project.create({
    name: name.trim(),
    description: description ? description.trim() : '',
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  });

  await ProjectMember.create({
    user: new mongoose.Types.ObjectId(req.user._id),
    project: new mongoose.Types.ObjectId(newProject._id),
    role: UserRolesEnum.ADMIN,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        project: newProject,
        role: UserRolesEnum.ADMIN,
      },
      'Project created successfully'
    )
  );
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { name, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, 'Invalid project id');
  }

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(description !== undefined ? { description: description.trim() } : {}),
    },
    { new: true }
  );

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, 'Project updated successfully'));
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, 'Invalid project id');
  }

  const project = await Project.findByIdAndDelete(projectId);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  // Cascading cleanup
  const pId = new mongoose.Types.ObjectId(projectId);
  const tasks = await Task.find({ project: pId }).select('_id');
  const taskIds = tasks.map((t) => t._id);

  await Promise.all([
    ProjectMember.deleteMany({ project: pId }),
    Task.deleteMany({ project: pId }),
    Subtask.deleteMany({ task: { $in: taskIds } }),
    ProjectNote.deleteMany({ project: pId }),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, project, 'Project deleted successfully'));
});

export const getProjectMembers = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, 'Invalid project id');
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const members = await ProjectMember.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        user: { $arrayElemAt: ['$user', 0] },
      },
    },
    {
      $project: {
        project: 1,
        user: 1,
        role: 1,
        createdAt: 1,
        updatedAt: 1,
        _id: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, members, 'Project members fetched successfully'));
});

export const addMembersToProject = asyncHandler(async (req: Request, res: Response) => {
  const { email, role } = req.body;
  const { projectId } = req.params;

  if (!email || !role) {
    throw new ApiError(400, 'Email and role are required');
  }

  if (!AvailableUserRole.includes(role)) {
    throw new ApiError(400, `Invalid role. Allowed roles: ${AvailableUserRole.join(', ')}`);
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, 'Invalid project id');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new ApiError(404, 'User with this email does not exist');
  }

  const member = await ProjectMember.findOneAndUpdate(
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId),
    },
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId),
      role,
    },
    {
      new: true,
      upsert: true,
    }
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        member,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
        },
      },
      'Project member added successfully'
    )
  );
});

export const updateMemberRole = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, userId } = req.params;
  const newRole = req.body.role || req.body.newRole;

  if (!newRole || !AvailableUserRole.includes(newRole)) {
    throw new ApiError(400, `Invalid role. Allowed roles: ${AvailableUserRole.join(', ')}`);
  }

  if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, 'Invalid project or user id');
  }

  const member = await ProjectMember.findOneAndUpdate(
    {
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(userId),
    },
    {
      $set: { role: newRole },
    },
    { new: true }
  );

  if (!member) {
    throw new ApiError(404, 'Project member not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, member, 'Project member role updated successfully'));
});

export const deleteMember = asyncHandler(async (req: Request, res: Response) => {
  const { projectId, userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, 'Invalid project or user id');
  }

  const member = await ProjectMember.findOneAndDelete({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId),
  });

  if (!member) {
    throw new ApiError(404, 'Project member not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, member, 'Project member deleted successfully'));
});
