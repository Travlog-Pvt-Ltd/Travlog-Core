import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
  name: String,
  isLocation: {
    type: Boolean,
    default: true
  },
  parent: {
    type: String,
    default: null
  }
})

const Tag = mongoose.model("Tag", tagSchema);

export default Tag;