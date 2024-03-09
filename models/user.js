import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  Mob: {
    type: String,
    default: null
  },
  city: {
    type: String,
    default: null
  },
  state: {
    type: String,
    default: null
  },
  country: {
    type: String,
    default: null
  },
  pincode: {
    type: String,
    default: null
  },
  gender: {
    type: String,
    default: null
  },
  DOB: {
    type: Date,
    default: null
  },
  age: {
    type: Number,
    default: null
  },
  about: {
    type: String,
    default: null
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Follower"
  }],
  followings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserInstance"
  }],
  visitors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserInstance"
  }],
  blogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog"
  }],
  impressions: {
    type: Number,
    default: null
  },
  profileImage: {
    type: String,
    default: null
  },
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "BlogInstance"
  }],
  itenaries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Itenary"
  }],
  drafts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Draft"
  }],
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Notification"
  }]
}, { timestamps: true }
)

const User = mongoose.model("User", userSchema);

export default User;