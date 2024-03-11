import xlsx from 'xlsx';
import Tag from '../../models/tags.js';


const createCities = async(req,res) => {
    const workbook = xlsx.readFile('worldcities.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    let cities=[]
    data.map(item=>{
        if(item.country=="India") cities.push({name:item.city.normalize("NFD").replace(/[\u0300-\u036f]/g, "")})
    })
    // const result = await Tag.insertMany(cities);
    res.status(200).json(cities)
}

export {createCities}