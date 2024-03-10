import xlsx from 'xlsx';
import Place from '../../models/places.js';


const createCities = async(req,res) => {
    // const workbook = xlsx.readFile('worldcities.xlsx');
    // const sheetName = workbook.SheetNames[0];
    // const sheet = workbook.Sheets[sheetName];
    // const data = xlsx.utils.sheet_to_json(sheet);
    // let cities=[]
    // data.map(item=>{
    //     if(item.country=="India") cities.push({name:item.city.normalize("NFD").replace(/[\u0300-\u036f]/g, "")})
    // })
    // console.log(cities.length);
    // const result = await Place.insertMany(cities);
    // res.status(200).json(cities)
}

export {createCities}