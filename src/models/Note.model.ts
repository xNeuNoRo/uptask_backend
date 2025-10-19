import {
  model,
  Schema,
  Types,
  type Document,
  type SchemaDefinition,
} from "mongoose";

import type { CreateOf } from "@/types/mongoose-utils";

export interface INote extends Document {
  content: string;
  createdBy: Types.ObjectId;
  task: Types.ObjectId;
}

export type NoteDTO = CreateOf<INote, "content" | "task" | "createdBy">;

const NoteSchemaDef: SchemaDefinition = {
  content: { type: String, required: true, trim: true },
  createdBy: { type: Types.ObjectId, ref: "User", required: true },
  task: { type: Types.ObjectId, ref: "Task", required: true },
};

const NoteSchema: Schema = new Schema<INote>(NoteSchemaDef, {
  timestamps: true,
});

export const Note = model<INote>("Note", NoteSchema);
export default Note;
