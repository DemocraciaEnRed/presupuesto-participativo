const fs = require('fs')
const c2j = require('csvtojson')
const { csv } = c2j

let jsonArray = null

csv()
.fromFile('./padron-mgp-unique.csv')
.then((jsonObj) => {
  jsonArray = jsonObj
  jsonArray = jsonArray.map((item) => item['MATRICULA'])
  console.log('Unique DNI counts: ' + jsonArray.length)
  // create the JSON object
  let jsonIds = jsonArray.map((item) => {
    return {
      dni: item
    }
  })
  // Write Json into file
  fs.writeFile('./padron-mgp-final.json', JSON.stringify(jsonIds), (err) => {
    if (err) throw err
    console.log('File successfully written!')
  })
})
