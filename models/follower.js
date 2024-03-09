import mongoose from "mongoose";

const followerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  notify: Boolean
}, {timestamps:true}
)

const Follower = mongoose.model("Follower", followerSchema);

export default Follower;