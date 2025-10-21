import {
  model,
  Schema,
  Types,
  type Document,
  type SchemaDefinition,
} from "mongoose";

import type { CreateOf } from "@/types/mongoose-utils";
import Note from "./Note.model";

export const taskStatus = {
  PENDING: "pending",
  ON_HOLD: "onHold",
  IN_PROGRESS: "inProgress",
  UNDER_REVIEW: "underReview",
  COMPLETED: "completed",
} as const;

export type TaskStatusType = (typeof taskStatus)[keyof typeof taskStatus];

export interface ITask extends Document {
  name: string;
  description: string;
  project: Types.ObjectId;
  status: TaskStatusType;
  changes: {
    user: Types.ObjectId | null;
    status: TaskStatusType;
    changedAt: Date;
  }[];
  notes: Types.ObjectId[];
}

export type TaskDTO = CreateOf<ITask, "name" | "description" | "status">;

const TaskSchemaDef: SchemaDefinition = {
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  project: { type: Types.ObjectId, ref: "Project", required: true },
  status: {
    type: String,
    enum: Object.values(taskStatus),
    default: taskStatus.PENDING,
  },
  changes: [
    {
      user: { type: Types.ObjectId, ref: "User", default: null },
      status: {
        type: String,
        enum: Object.values(taskStatus),
        default: taskStatus.PENDING,
      },
      changedAt: { type: Date, default: Date.now },
    },
  ],
  notes: [{ type: Types.ObjectId, ref: "Note" }],
};

const TaskSchema: Schema = new Schema<ITask>(TaskSchemaDef, {
  timestamps: true,
});

// Middleware
TaskSchema.pre<ITask>("deleteOne", { document: true }, async function () {
  // Cascade delete notes associated with the task
  const taskId = this._id;
  if (!taskId) return;
  await Note.deleteMany({ task: taskId });
});

const Task = model<ITask>("Task", TaskSchema);
export default Task;
