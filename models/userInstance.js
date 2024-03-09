import mongoose from "mongoose";

const userInstanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
}, {timestamps:true}
)

const UserInstance = mongoose.model("UserInstance", userInstanceSchema);

export default UserInstance;