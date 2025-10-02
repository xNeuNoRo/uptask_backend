import type { Document } from "mongoose";

// Remove Mongoose Document properties (except _id) from a type
export type StripDocument<T> = Omit<T, keyof Document>;

// Select Specific properties from a type
export type CreateOf<T, K extends keyof StripDocument<T>> = Pick<
  StripDocument<T>,
  K
>;

export type UpdateOf<T, K extends keyof StripDocument<T>> = Partial<
  Pick<StripDocument<T>, K>
>;
