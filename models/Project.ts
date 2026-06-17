import mongoose, { Schema, model, models } from 'mongoose';
import crypto from 'crypto';

const ProjectMemberSchema = new Schema(
  {
    userId:   { type: String, required: true },
    role:     { type: String, enum: ['owner', 'member'], required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const ProjectSchema = new Schema(
  {
    name:        { type: String, required: true, maxlength: 50, trim: true },
    icon:        { type: String, required: true },
    ownerId:     { type: String, required: true },
    inviteToken: {
      type:     String,
      required: true,
      unique:   true,
      default:  () => crypto.randomBytes(16).toString('hex'),
    },
    members:    { type: [ProjectMemberSchema], default: [] },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

ProjectSchema.index({ 'members.userId': 1 });

export const ProjectModel = models.Project ?? model('Project', ProjectSchema);
