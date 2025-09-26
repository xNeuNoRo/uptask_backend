import { model, Schema, Document, SchemaDefinition } from "mongoose";

export type ProjectType = Document & {
  projectName: string;
  clientName: string;
  description: string;
};

const ProjectSchemaDef: SchemaDefinition = {
  projectName: { type: String, required: true, trim: true },
  clientName: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
};

const ProjectSchema: Schema = new Schema<ProjectType>(ProjectSchemaDef);

const Project = model<ProjectType>("Project", ProjectSchema);
export default Project;
