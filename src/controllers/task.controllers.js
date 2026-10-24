import {User} from "../models/user.models.js"
import {Project} from "../models/project.models.js"
import {Task} from "../models/task.models.js"
import {Subtask} from "../models/subtask.models.js"
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constant.js";

const getTasks = asyncHandler(async(req,res)=>{
    //chai
})
const createTask = asyncHandler(async(req,res)=>{
    //chai
})
const getTasksById = asyncHandler(async(req,res)=>{
    //chai
})
const updateTask = asyncHandler(async(req,res)=>{
    //chai
})
const deleteTask = asyncHandler(async(req,res)=>{
    //chai
})
const createSubTask = asyncHandler(async(req,res)=>{
    //chai
})
const updateSubTask = asyncHandler(async(req,res)=>{
    //chai
})
const deleteSubTask = asyncHandler(async(req,res)=>{
    //chai
})

export{
    createSubTask,
    createTask,
    deleteSubTask,
    deleteTask,
    getTasksById,
    getTasks,
    updateSubTask,
    updateTask,
}

