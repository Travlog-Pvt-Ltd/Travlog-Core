import Activity from '@models/activities.js';

const createActivities = async (req, res) => {
    const data = [
        { name: 'Hiking', types: ['Adventure', 'Mountains', 'Hill Station'] },
        {
            name: 'Backpacking',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        { name: 'Camping', types: ['Adventure', 'Mountains', 'Hill Station'] },
        { name: 'Trekking', types: ['Adventure', 'Mountains', 'Hill Station'] },
        {
            name: 'Mountain Climbing',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        {
            name: 'Rock Climbing',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        { name: 'Biking', types: ['Adventure', 'Mountains', 'Roads'] },
        {
            name: 'Mountain biking',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        {
            name: 'Road biking',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        { name: 'Kayaking', types: ['Adventure', 'Water Bodies', 'Rivers'] },
        { name: 'Canoeing', types: ['Adventure', 'Water Bodies', 'Rivers'] },
        { name: 'Rafting', types: ['Adventure', 'Water Bodies', 'Rivers'] },
        {
            name: 'Zip-lining',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        {
            name: 'Paragliding',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        {
            name: 'Skydiving',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        {
            name: 'Bungee Jumping',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        {
            name: 'Hot Air Balloon',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        {
            name: 'Wildlife Safari',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        {
            name: 'Snorkeling',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        {
            name: 'Scuba Diving',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        { name: 'Surfing', types: ['Adventure', 'Mountains', 'Hill Station'] },
        {
            name: 'Windsurfing',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        {
            name: 'Kitesurfing',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        {
            name: 'Jet Skiing',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        {
            name: 'Parasailing',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        {
            name: 'Horseback Riding',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        {
            name: 'Camel Riding',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        {
            name: 'Elephant Riding',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        {
            name: 'Dog Sledding',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        {
            name: 'Snowmobiling',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        {
            name: 'Snowboarding',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        { name: 'Skiing', types: ['Adventure', 'Mountains', 'Hill Station'] },
        {
            name: 'Snowshoeing',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        {
            name: 'Ice Climbing',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        {
            name: 'Ice Skating',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        { name: 'Sledding', types: ['Adventure', 'Mountains', 'Hill Station'] },
        {
            name: 'Tobogganing',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        {
            name: 'Safari',
            types: ['Adventure', 'Mountains', 'Forest', 'Wildlife'],
        },
        { name: 'Museum', types: ['Adventure', 'Mountains', 'Hill Station'] },
        {
            name: 'Art Galleries',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        {
            name: 'Music Festivals',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        {
            name: 'Film Festivals',
            types: ['Adventure', 'Mountains', 'Hill Station'],
        },
        { name: 'Spa', types: ['Hotels', 'City'] },
        {
            name: 'Caving',
            types: ['Adventure', 'Mountains', 'Forests', 'Wildlife', 'Sea'],
        },
    ];
    // const result = await Activity.insertMany(data)
    res.status(201).json(data);
};

export { createActivities };
