import mongoose from "mongoose";

const placeSchema = new mongoose.Schema({
  name: String,
})

const Place = mongoose.model("Place", placeSchema);

export default Place;