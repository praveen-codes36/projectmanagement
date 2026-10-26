import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constant.js";

const getProjects = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const memberships = await ProjectMember.find({
    user: new mongoose.Types.ObjectId(userId),
  }).lean();

  if (memberships.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "Projects fetched successfully"));
  }

  const projectIds = memberships.map((m) => m.project);
  const projects = await Project.find({ _id: { $in: projectIds } }).lean();

  const memberCounts = await ProjectMember.aggregate([
    { $match: { project: { $in: projectIds } } },
    { $group: { _id: "$project", count: { $sum: 1 } } },
  ]);

  const countMap = new Map();
  memberCounts.forEach((mc) => countMap.set(String(mc._id), mc.count));

  const roleMap = new Map();
  memberships.forEach((m) => roleMap.set(String(m.project), m.role));

  const result = projects.map((p) => {
    const pIdStr = String(p._id);
    return {
      project: {
        _id: p._id,
        name: p.name,
        description: p.description || "",
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
    .json(new ApiResponse(200, result, "Projects fetched successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const project = await Project.findById(projectId).lean();

  if (!project) {
    throw new ApiError(404, "Project not found");
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
      "Project fetched successfully"
    )
  );
});

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, "Project name is required");
  }

  const createdProject = await Project.create({
    name: name.trim(),
    description: description ? description.trim() : "",
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  });

  await ProjectMember.create({
    user: new mongoose.Types.ObjectId(req.user._id),
    project: new mongoose.Types.ObjectId(createdProject._id),
    role: UserRolesEnum.ADMIN,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        ...createdProject.toObject(),
        memberCount: 1,
        currentUserRole: UserRolesEnum.ADMIN,
      },
      "Project created successfully"
    )
  );
});

const updateProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const updatedProject = await Project.findByIdAndUpdate(
    projectId,
    {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(description !== undefined ? { description: description.trim() } : {}),
    },
    { new: true }
  );

  if (!updatedProject) {
    throw new ApiError(404, "Project not found");
  }

  return res.status(200).json(
    new ApiResponse(200, updatedProject, "Project updated successfully")
  );
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const project = await Project.findByIdAndDelete(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  await ProjectMember.deleteMany({ project: new mongoose.Types.ObjectId(projectId) });

  return res.status(200).json(
    new ApiResponse(200, project, "Project deleted successfully")
  );
});

const addMembersToProject = asyncHandler(async (req, res) => {
  const { email, role } = req.body;
  const { projectId } = req.params;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new ApiError(404, "User not found with this email");
  }

  const targetRole = AvailableUserRole.includes(role) ? role : UserRolesEnum.MEMBER;

  const member = await ProjectMember.findOneAndUpdate(
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId),
    },
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId),
      role: targetRole,
    },
    {
      new: true,
      upsert: true,
    }
  );

  return res.status(201).json(
    new ApiResponse(201, member, "Project member added successfully")
  );
});

const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const projectMembers = await ProjectMember.find({
    project: new mongoose.Types.ObjectId(projectId),
  })
    .populate("user", "_id username fullName email avatar")
    .lean();

  return res.status(200).json(
    new ApiResponse(200, projectMembers, "Project members fetched successfully")
  );
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { role } = req.body;

  if (!AvailableUserRole.includes(role)) {
    throw new ApiError(400, "Invalid role specified");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid project or user id");
  }

  const projectMember = await ProjectMember.findOneAndUpdate(
    {
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(userId),
    },
    { role },
    { new: true }
  ).populate("user", "_id username fullName email avatar");

  if (!projectMember) {
    throw new ApiError(404, "Project member not found");
  }

  return res.status(200).json(
    new ApiResponse(200, projectMember, "Project member role updated successfully")
  );
});

const deleteMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid project or user id");
  }

  const projectMember = await ProjectMember.findOneAndDelete({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId),
  });

  if (!projectMember) {
    throw new ApiError(404, "Project member not found");
  }

  return res.status(200).json(
    new ApiResponse(200, projectMember, "Project member removed successfully")
  );
});

export {
  addMembersToProject,
  createProject,
  deleteMember,
  getProjects,
  getProjectById,
  getProjectMembers,
  updateProject,
  deleteProject,
  updateMemberRole,
};
