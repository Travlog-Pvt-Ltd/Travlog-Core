import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  name: String,
})

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;