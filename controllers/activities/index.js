import Tag from "../../models/tags.js";

const createActivities = async(req,res) => {
    const data = ["Hiking", "Backpacking", "Camping", "Trekking", "Mountain Climbing", "Rock Climbing", "Biking", "Mountain biking", "Road biking", "Kayaking", "Canoeing", "Rafting", "Zip-lining", "Paragliding", "Skydiving", "Bungee Jumping", "Hot Air Balloon", "Wildlife Safari", "Snorkeling", "Scuba Diving", "Surfing", "Windsurfing", "Kitesurfing", "Jet Skiing", "Parasailing", "Horseback Riding", "Camel Riding", "Elephant Riding", "Dog Sledding", "Snowmobiling", "Snowboarding", "Skiing", "Snowshoeing", "Ice Climbing", "Ice Skating", "Sledding", "Tobogganing", "Fishing", "Safari", "Museum", "Art Galleries", "Music Festivals", "Film Festivals", "Spa", "Caving"]
    const activities = [];
    data.map(item=>{
        activities.push({name:item, isLocation:false})
    })
    // const result = await Tag.insertMany(activities)
    res.status(201).json(activities)
}

export {createActivities}