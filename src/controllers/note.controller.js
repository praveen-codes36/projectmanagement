import { ProjectNote } from "../models/note.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";


export const getNotes = asyncHandler(async(req,res)=>{
    const {projectId}=req.params;

    const notes = await ProjectNote.find({project: projectId})
        .populate("createdBy","username fullName avatar");

    return res
        .status(200)
        .json(new ApiResponse(200,notes,"Notes fetched successfully"));
})

export const getNoteById = asyncHandler(async(req,res)=>{
    const {projectId,noteId}=req.params;

    const note = await ProjectNote.findOne({_id: noteId, project: projectId})
        .populate("createdBy","username fullName avatar");

    if(!note){
        throw new ApiError(404,"Note not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200,note,"Note fetched successfully"));
})

export const createNote = asyncHandler(async(req,res)=>{
    const {projectId}=req.params;
    const {content}=req.body;

    const note = await ProjectNote.create({
        project: projectId,
        createdBy: req.user._id,
        content,
    })

    return res
        .status(201)
        .json(new ApiResponse(201,note,"Note created successfully"));
})

export const updateNote = asyncHandler(async(req,res)=>{
    const {projectId,noteId}=req.params;
    const {content}=req.body;

    const note = await ProjectNote.findOneAndUpdate(
        {_id: noteId, project: projectId},
        {content},
        {new: true},
    )

    if(!note){
        throw new ApiError(404,"Note not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200,note,"Note updated successfully"));
})

export const deleteNote = asyncHandler(async(req,res)=>{
    const {projectId,noteId}=req.params;

    const note = await ProjectNote.findOneAndDelete({_id: noteId, project: projectId});

    if(!note){
        throw new ApiError(404,"Note not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200,note,"Note deleted successfully"));
})