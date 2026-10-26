import mongoose from "mongoose";
import { Project } from "../models/project.models.js";
import { ProjectNote } from "../models/note.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

const getNotes = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const notes = await ProjectNote.find({
    project: new mongoose.Types.ObjectId(projectId),
  })
    .populate("createdBy", "_id username fullName avatar email")
    .sort({ createdAt: -1 })
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, notes, "Notes fetched successfully"));
});

const createNote = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    throw new ApiError(400, "Note content cannot be empty");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const note = await ProjectNote.create({
    project: new mongoose.Types.ObjectId(projectId),
    createdBy: new mongoose.Types.ObjectId(req.user?._id),
    content: content.trim(),
  });

  const populatedNote = await ProjectNote.findById(note._id)
    .populate("createdBy", "_id username fullName avatar email")
    .lean();

  return res
    .status(201)
    .json(new ApiResponse(201, populatedNote, "Note created successfully"));
});

const getNoteById = asyncHandler(async (req, res) => {
  const { noteId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    throw new ApiError(400, "Invalid note id");
  }

  const note = await ProjectNote.findById(noteId)
    .populate("createdBy", "_id username fullName avatar email")
    .lean();

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note fetched successfully"));
});

const updateNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    throw new ApiError(400, "Note content cannot be empty");
  }

  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    throw new ApiError(400, "Invalid note id");
  }

  const note = await ProjectNote.findByIdAndUpdate(
    noteId,
    { content: content.trim() },
    { new: true }
  ).populate("createdBy", "_id username fullName avatar email");

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note updated successfully"));
});

const deleteNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    throw new ApiError(400, "Invalid note id");
  }

  const note = await ProjectNote.findByIdAndDelete(noteId);
  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note deleted successfully"));
});

export {
  createNote,
  deleteNote,
  getNoteById,
  getNotes,
  updateNote,
};
