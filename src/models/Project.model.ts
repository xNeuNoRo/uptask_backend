import {
  model,
  Schema,
  Types,
  type Document,
  type SchemaDefinition,
  type PopulatedDoc,
} from "mongoose";

import Task, { type ITask } from "@/models/Task.model";
import type { CreateOf } from "@/types/mongoose-utils";

import Note from "./Note.model";
import type { IUser } from "./User.model";

export interface IProject extends Document {
  projectName: string;
  clientName: string;
  description: string;
  tasks: PopulatedDoc<ITask & Document>[];
  manager: PopulatedDoc<IUser & Document>;
  team: PopulatedDoc<IUser & Document>[];
}

export type ProjectDTO = CreateOf<
  IProject,
  "projectName" | "clientName" | "description"
>;

const ProjectSchemaDef: SchemaDefinition = {
  projectName: { type: String, required: true, trim: true },
  clientName: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  tasks: [{ type: Types.ObjectId, ref: "Task" }],
  manager: { type: Types.ObjectId, ref: "User", required: true },
  team: [{ type: Types.ObjectId, ref: "User" }],
};

const ProjectSchema: Schema = new Schema<IProject>(ProjectSchemaDef, {
  timestamps: true,
});

// Middleware
ProjectSchema.pre<IProject>("deleteOne", { document: true }, async function () {
  // Cascade delete tasks and their notes associated with the project
  const projectId = this._id;
  if (!projectId) return;
  // First, find all tasks ids associated with the project
  const taskIds = await Task.find({ project: projectId }).distinct("_id");
  // Then, delete all notes associated with those tasks
  await Note.deleteMany({ task: { $in: taskIds } });
  // Finally, delete the tasks themselves
  await Task.deleteMany({ project: projectId });
});

const Project = model<IProject>("Project", ProjectSchema);
export default Project;
