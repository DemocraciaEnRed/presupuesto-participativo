const dbReady = require('lib/models').ready
const models = require('lib/models')

const nombreMigrationParaLog = 'abrir propuestas'
const Forum = models.Forum

/**
 * Make any changes you need to make to the database here
 */
exports.up = function up (done) {
  // done() devuelve al Migrator de lib/migrations
  dbReady()

    // Código principal de migración
    .then(() => Forum.findOne({ 'name': 'proyectos' }))
    .then((forum) => {
      forum.set('visibility', 'collaborative')
      return forum.save()
    })

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
