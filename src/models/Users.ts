import mongoose, { Document, Schema, Model } from "mongoose";
import { IUser } from "../types";

// 2️⃣ Define the schema
const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "testCreator", "testTaker"],
      default: "testTaker",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the testCreator
      required: false,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true },
);

// 3️⃣ Create the model
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
