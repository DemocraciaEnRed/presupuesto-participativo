const dbReady = require('lib/models').ready
const models = require('lib/models')

const nombreMigrationParaLog = 'cargar zonas'
const Zona = models.Zona

const zonas = [
  {
    nombre: 'Zona 1',
  },
  {
    nombre: 'Zona 2',
  },
  {
    nombre: 'Zona 3',
  },
  {
    nombre: 'Zona 4',
  },
  {
    nombre: 'Zona 5',
  },
  {
    nombre: 'Zona 6',
  },
  {
    nombre: 'Zona 7',
  },
  {
    nombre: 'Zona 8',
  },
  {
    nombre: 'Zona 9',
  },
  {
    nombre: 'Zona 10',
  },
  {
    nombre: 'Zona 11',
  },
]

/**
 * Make any changes you need to make to the database here
 */
exports.up = function up(done) {
  // done() devuelve al Migrator de lib/migrations
  dbReady()

    // Primero chequear si ya no hay cosas cargadas
    .then(() => {
      return new Promise((resolve, reject) => {
        Zona.collection.count({}, (err, count) => {
          if (err) reject(new Error(err))
          if (count) {
            console.log('Ya hay zonas cargadas (%s), salteando migración', count)
            reject(new SaltearPromises())
          }
          resolve()
        })
      })
    })

    // Agregamos data
    .then(() => Zona.collection.insertMany(zonas))

    // Todo OK
    .then(() => {
      console.log(`-- Migración ${nombreMigrationParaLog} exitosa`)
      done()
    })
    // Error
    .catch((err) => {
      console.log(`-- Migración ${nombreMigrationParaLog} no funcionó! Error: ${err}`)
      done(err)
    })
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
exports.down = function down(done) {
  done();
};
