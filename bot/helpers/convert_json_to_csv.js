const json2csv = require('json2csv')
const fs = require('fs')
const path = require('path')

exports.covert_json_to_csv = (data, file_name) => {
    if (typeof data != "object")
        throw new Error("Please provide array data in convert into csv");
    let csv_folder = path.join(__dirname, "../", "Csv Files");
    if (!fs.existsSync(csv_folder)) fs.mkdirSync(csv_folder);
    let folder = path.join(csv_folder, file_name + `${new Date().getTime()}`);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);
    const csvFields = Object.keys(data[0]);
    let csv = json2csv.parse(data, { fields: csvFields })
    let file_path = path.join(folder, `${file_name}`) + ".csv";
    fs.writeFile(file_path, csv, (err) => {
        if (err) console.log(err);
    });
    return file_path;
};