import {
  model,
  Schema,
  Types,
  type Document,
  type SchemaDefinition,
} from "mongoose";

import type { CreateOf } from "@/types/mongoose-utils";

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
};

const TaskSchema: Schema = new Schema<ITask>(TaskSchemaDef, {
  timestamps: true,
});

const Task = model<ITask>("Task", TaskSchema);
export default Task;
