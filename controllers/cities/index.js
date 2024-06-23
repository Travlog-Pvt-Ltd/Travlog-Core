import xlsx from 'xlsx';
import Place from '../../models/place.js';

const createCities = async (req, res) => {
    try {
        // const workbook = xlsx.readFile('worldcities.xlsx')
        // const sheetName = workbook.SheetNames[0]
        // const sheet = workbook.Sheets[sheetName]
        // const data = xlsx.utils.sheet_to_json(sheet)
        // let cities = []
        // data.map(item => {
        //     const admin = item.admin_name ? item.admin_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : null
        //     if (!admin || admin == item.city) {
        //         cities.push({ name: item.city, parent: item.country })
        //     }
        //     else {
        //         cities.push({ name: item.city, parent: admin })
        //     }
        // })
        // let added = 0, errors = 0
        // const promises = cities.map(async (item) => {
        //     try {
        //         const parentCity = await Place.findOne({ name: item.parent })
        //         if (parentCity?._id) {
        //             await Place.create({ name: item.name, parent: parentCity._id })
        //             added += 1
        //         }
        //         else errors += 1
        //     } catch (err) {
        //         errors += 1
        //     }
        // })
        // await Promise.all(promises)
        // res.status(201).json({ added, errors })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export { createCities };
