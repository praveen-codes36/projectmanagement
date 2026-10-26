import mongoose, { Schema, Document } from 'mongoose';
import { AvailableUserRole, UserRolesEnum, UserRole } from '../utils/constants';

export interface IProjectMember extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  project: mongoose.Types.ObjectId;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const projectMemberSchema = new Schema<IProjectMember>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: AvailableUserRole,
      default: UserRolesEnum.MEMBER,
    },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness per user-project pairing
projectMemberSchema.index({ user: 1, project: 1 }, { unique: true });

export const ProjectMember =
  mongoose.models.ProjectMember ||
  mongoose.model<IProjectMember>('ProjectMember', projectMemberSchema);
