const fs = require('fs')
const c2j = require('csvtojson')
const { csv } = c2j

let jsonArray = null

// complete here
let repeated = []

csv()
  .fromFile('./padron.csv')
.then((jsonObj) => {
  jsonArray = jsonObj
  jsonArray = jsonArray.map((item) => item['MATRICULA'])
  console.log('Original DNI counts: ' + jsonArray.length)
  console.log('Repeated DNI counts: ' + repeated.length)
  // leave unique values in the array and log the progress
  let onlyUniques = jsonArray.filter((item, pos) => {
    console.log(pos)
    return jsonArray.indexOf(item) === pos
  })
  console.log('Unique DNI counts: ' + onlyUniques.length)
  // write the unique values to a new file
  let uniqueFile = fs.createWriteStream('./padron-unique.csv')
  uniqueFile.write('MATRICULA\n')
  onlyUniques.forEach((item) => {
    uniqueFile.write(item + '\n')
  })
  uniqueFile.end()
  console.log('Unique DNI file created')
})