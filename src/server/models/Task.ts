import mongoose, { Schema, Document } from 'mongoose';
import { AvailableTaskStatuses, TaskStatusEnum, TaskStatus } from '../utils/constants';

export interface IAttachment {
  url: string;
  mimetype?: string;
  size?: number;
  originalname?: string;
}

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  project: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  assignedBy?: mongoose.Types.ObjectId;
  status: TaskStatus;
  attachments: IAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: AvailableTaskStatuses,
      default: TaskStatusEnum.TODO,
    },
    attachments: {
      type: [
        {
          url: { type: String, required: true },
          mimetype: { type: String },
          size: { type: Number },
          originalname: { type: String },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const Task = mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema);
