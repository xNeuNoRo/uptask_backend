import {
  model,
  Schema,
  Types,
  type Document,
  type SchemaDefinition,
  type PopulatedDoc,
} from "mongoose";

import type { ITask } from "@/models/task.model";
import type { CreateOf } from "@/types/mongoose-utils";

export interface IProject extends Document {
  projectName: string;
  clientName: string;
  description: string;
  tasks: PopulatedDoc<ITask & Document>[];
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
};

const ProjectSchema: Schema = new Schema<IProject>(ProjectSchemaDef, {
  timestamps: true,
});

const Project = model<IProject>("Project", ProjectSchema);
export default Project;
