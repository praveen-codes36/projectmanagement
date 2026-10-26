import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  avatar: {
    url: string;
    localPath?: string;
  };
  username: string;
  email: string;
  fullName?: string;
  password?: string;
  isEmailVerified: boolean;
  refreshToken?: string;
  forgetPasswordToken?: string;
  forgetPasswordExpiry?: Date;
  emailVerificationToken?: string;
  emailVerificationExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  generateTemporaryToken(): { unHashedToken: string; hashedToken: string; tokenExpiry: number };
}

const userSchema = new Schema<IUser>(
  {
    avatar: {
      type: Schema.Types.Mixed,
      default: {
        url: 'https://placehold.co/200x200',
        localPath: '',
      },
      set: (val: any) => {
        if (typeof val === 'string') {
          return { url: val, localPath: '' };
        }
        return val;
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    forgetPasswordToken: {
      type: String,
    },
    forgetPasswordExpiry: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
    },
    emailVerificationExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  const secret = process.env.ACCESS_TOKEN_SECRET || 'project_camp_access_secret_2026';
  const expiry = process.env.ACCESS_TOKEN_EXPIRY || '1d';
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    secret,
    { expiresIn: expiry } as any
  );
};

userSchema.methods.generateRefreshToken = function () {
  const secret = process.env.REFRESH_TOKEN_SECRET || 'project_camp_refresh_secret_2026';
  const expiry = process.env.REFRESH_TOKEN_EXPIRY || '10d';
  // Critical fix: return the signed token!
  return jwt.sign(
    {
      _id: this._id,
    },
    secret,
    { expiresIn: expiry } as any
  );
};

userSchema.methods.generateTemporaryToken = function () {
  const unHashedToken = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(unHashedToken).digest('hex');
  const tokenExpiry = Date.now() + 20 * 60 * 1000; // 20 minutes
  return { unHashedToken, hashedToken, tokenExpiry };
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
