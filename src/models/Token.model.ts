import {
  model,
  PopulatedDoc,
  Schema,
  Types,
  type Document,
  type SchemaDefinition,
} from "mongoose";

import type { CreateOf } from "@/types/mongoose-utils";
import { IUser } from "./User.model";

export const tokenType = {
  VERIFY_EMAIL: "verifyEmail",
  CHANGE_EMAIL: "changeEmail",
  RESET_PASSWORD: "resetPassword",
  TWO_FACTOR_AUTH: "twoFactorAuth",
  MAGIC_LINK: "magicLink",
} as const;

export type TokenType = (typeof tokenType)[keyof typeof tokenType];

export interface IToken extends Document {
  token?: string;
  type: TokenType;
  user: Types.ObjectId;
  expiresAt: Date;
}

export type TokenDTO = CreateOf<
  IToken,
  "token" | "type" | "user" | "expiresAt"
>;

const TokenSchemaDef: SchemaDefinition = {
  token: {
    type: String,
    default: null,
  },
  type: { type: String, enum: Object.values(tokenType), required: true },
  user: { type: Types.ObjectId, ref: "User", required: true },
  expiresAt: {
    type: Date,
    required: true,
    index: {
      // Podria ser un valor mayor para q lo elimine unos segundos despues de expirar
      expireAfterSeconds: 0, // para que lo elimine justo cuando expire la fecha
    },
  },
};

const TokenSchema: Schema = new Schema<IToken>(TokenSchemaDef);

const Token = model<IToken>("Token", TokenSchema);
export default Token;
