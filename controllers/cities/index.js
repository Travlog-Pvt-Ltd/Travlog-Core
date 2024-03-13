import xlsx from 'xlsx'
import Tag from '../../models/tags.js'


const createCities = async(req,res) => {
    const workbook = xlsx.readFile('worldcities.xlsx')
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(sheet)
    let cities=[]
    data.map(item=>{
        const admin = item.admin_name ? item.admin_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : null
        if(!admin || admin==item.city){
            cities.push({name:item.city, parent:item.country})
        }
        else{
            cities.push({name:item.city, parent:admin})
        }
    })
    // const result = await Tag.insertMany(cities)
    res.status(200).json(cities)
}

export {createCities}