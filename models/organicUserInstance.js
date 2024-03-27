import mongoose from "mongoose";

const organicUserInstanceSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
}, {timestamps:true}
)

const OrganicUserInstance = mongoose.model("OrganicUserInstance", organicUserInstanceSchema);

export default OrganicUserInstance;