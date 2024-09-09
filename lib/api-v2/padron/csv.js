const debug = require('debug')
const log = debug('democracyos:api:padroncsv')

const express = require('express')
var utils = require('lib/utils')
var restrict = utils.restrict
var staff = utils.staff
//var maintenance = utils.maintenance
const json2csv = require('json-2-csv').json2csv
const csv2json = require('json-2-csv').csv2json

const dbApi = require('lib/db-api')

const app = module.exports = express.Router()

function escapeTxt (text) {
  if (!text) return ''
  text += ''
  return text.replace(/"/g, '\'').replace(/\r/g, '').replace(/\n/g, '')
}

app.get('/padron/all/csv',
  restrict,
  staff,
  function getZonas(req, res, next){
    log('Getting zonas')
    dbApi.zona.getAll().then((zonas) => {
      if(zonas){
        log('Serving zonas')
        // conver every item toJson
        // let aux = facultades.map(fac => fac.toJSON())
        // console.log(aux)
        req.zonas = zonas
        next()
      } 
    })
  },
  function getPadron(req, res, next) {
    log('Getting padron')
    dbApi.padron.getAll().then((data) => {
      if (data) {
        log('Serving padron')
        req.data = data
        next()
      } else {
        return res.status(500).end()
      }
    }).catch(err => {
      log('Error getting padron', err)
      return res.status(500).end()
    })
  },
  function sendCsv (req, res, next) {
    var infoPadron = req.data.map((p) => {
      let auxZona = null
      if (p.user) {
        auxZona = req.zonas.find((z) => z._id.toJSON() == p.user.zona)
      }
      return [
        p.dni,
        p.user ? p.user.firstName : '-',
        p.user ? p.user.lastName : '-',
        p.user ? p.user.email : '-',
        p.user ? (auxZona ? auxZona.nombre : '-') : '-',
        p.voted ? 'Si' : 'No'
      ]
    })
    var data = [['DNI', 'Nombre', 'Apellido', 'Email', 'Zona', 'Votó']]
    data = data.concat(infoPadron)
    json2csv(data, function (err, csv) {
      if (err) {
        log('get csv: array to csv error', err)
        return res.status(500).end()
      }
      res.status(200)
      res.set({
        'Content-Encoding': 'UTF-8',
        'Content-Type': 'text/csv; charset=UTF-8',
        'Content-Disposition': `attachment; filename=padron-ppmgp-${Math.floor((new Date()) / 1000)}.csv`
      })
      res.write(csv)
      res.end()
    }, { prependHeader: false, excelBOM: true })
  }
)

// app.post('/padron/bulk/csv',
//   restrict,
//   staff,
//   function readCSV (req, res, next) {
//     log('Reading CSV')
//     console.log(req.body)
//     var csv = req.body.csv
//     if(!csv){
//       return res.status(500).end()
//     }
//     csv2json(csv, function(err, json){
//       if (err){
//         log('csv to array error', err)
//         return res.status(500).end()
//       }
//       req.listDocuments = json.map(d => Object.values(d)[0].trim())
//       console.log(req.listDocuments)
//       next()
//     })
//   },
//   function deleteDuplicates (req, res, next) {
//     log('Deleting duplicates from listDocuments')
//     // delete from req.listDocuments array any duplicate
//     req.listDocuments = req.listDocuments.filter((v, i, a) => a.indexOf(v) === i)
//     next()
//   },
//   async function checkDNI(req, res, next){
//     // Checking every document is not in the padron
//     log('Checking every document is not in the padron')
//     let inPadron = []
//     for(var i = 0; i < req.listDocuments.length; i++){
//       var dni = req.listDocuments[i]
//       var padron = await dbApi.padron.isDNIPadron(dni)
//       if (padron) {
//         log('DNI in padron', dni)
//         inPadron.push(dni)
//       }
//       // if(padron){
//         // return a 400 with a message  
//         // return res.status(400).json({
//         //   message: `El documento ${dni} ya está en el padrón`
//         // })
//       // }
//     }
//     if(inPadron.length > 0){
//       return res.status(400).json({
//         message: `Los documentos ${inPadron.join(', ')} ya están en el padrón`,
//         status: 400
//       })
//     }
//     next()
//   },
//   async function insertDocuments (req, res, next) {
//     let newDocuments = req.listDocuments.map(d => {
//       return {
//         dni: d
//       }
//     })
//     log('Inserting documents')
//     let insertedDocuments = await dbApi.padron.insertMany(newDocuments)
//     if (insertedDocuments){
//       log('Documents inserted')
//       // return a 200
//       return res.status(200).json({
//         message: `${ insertedDocuments.length } Documentos insertados correctamente`,
//         status: 200,
//         insertedDocuments
//       })
//     }
//   }
// )
