const dbReady = require('lib/models').ready
const models = require('lib/models')

const nombreMigrationParaLog = 'cargar etiquetas y ejes'
const Tag = models.Tag
const Eje = models.Eje

const etiquetas = [
  { nombre: 'Otras Ideas Innovadoras' },
  { nombre: 'Asfalto/Mejora asfaltica' },
  { nombre: 'Luminarias' },
  { nombre: 'Semáforos/Reductores de velocidad' },
  { nombre: 'Plazas/Espacios públicos' },
  { nombre: 'Capacitaciones/Actividades deportivas' },
  { nombre: 'Bicisendas' },
  { nombre: 'Mejoras de accesibilidad' },
  { nombre: 'Ideas para Organizaciones/Clubes' },
]

const tags = etiquetas.map(etiqueta => {
  return {
    name: etiqueta.nombre,
    hash: etiqueta.nombre.toLowerCase().replace(/ /g, '-'),
    image: 'people',
    color: '#091A33'
  }
})

const ejes = [
  { nombre: 'Innovación' },
  { nombre: 'Proximidad y sustentabilidad' },
  { nombre: 'Género e inclusión' },
  { nombre: 'Aprendizajes, investigación e internacionalización' },
  { nombre: 'Modernización y transparencia' },
  { nombre: 'Bioseguridad' },
  { nombre: 'Otro' },
]

/**
 * Make any changes you need to make to the database here
 */
exports.up = function up(done) {
  // done() devuelve al Migrator de lib/migrations
  dbReady()

    // borramos data vieja
    .then(() => Tag.collection.deleteMany({}))
    .then(() => Eje.collection.deleteMany({}))

    // Agregamos data
    .then(() => Tag.insertMany(tags))
    .then(() => Eje.insertMany(ejes))

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
