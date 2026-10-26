import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectNote extends Document {
  _id: mongoose.Types.ObjectId;
  project: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const projectNoteSchema = new Schema<IProjectNote>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const ProjectNote =
  mongoose.models.ProjectNote || mongoose.model<IProjectNote>('ProjectNote', projectNoteSchema);
