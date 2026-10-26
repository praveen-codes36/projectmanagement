import mongoose, { Schema, Document } from 'mongoose';

export interface ISubtask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  task: mongoose.Types.ObjectId;
  isCompleted: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subtaskSchema = new Schema<ISubtask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export const Subtask =
  mongoose.models.Subtask || mongoose.model<ISubtask>('Subtask', subtaskSchema);
export const subTask = Subtask;
