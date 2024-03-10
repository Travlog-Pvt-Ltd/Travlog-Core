import mongoose from "mongoose";

const singleBlogSchema = new mongoose.Schema({
  blogId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog"
  }
}, {timestamps:true}
)

const BlogInstance = mongoose.model("BlogInstance", singleBlogSchema);

export default BlogInstance;