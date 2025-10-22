import { model, Schema, type Document, type SchemaDefinition } from "mongoose";

import type { CreateOf } from "@/types/mongoose-utils";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  confirmed: boolean;
}

export type UserDTO = CreateOf<IUser, "name" | "email" | "password">;

const UserSchemaDef: SchemaDefinition = {
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
  },
  password: { type: String, required: true },
  confirmed: { type: Boolean, default: false },
};

const UserSchema: Schema = new Schema<IUser>(UserSchemaDef, {
  timestamps: true,
});

const User = model<IUser>("User", UserSchema);
export default User;
