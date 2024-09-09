const dbReady = require('lib/models').ready
const models = require('lib/models')
const ObjectID = require('mongoose').Types.ObjectId
const nombreMigrationParaLog = 'Cambio estructura de Tag dentro del Topic. (tags por tag)'
const Topic = models.Topic
const Tag = models.Tag

/**
 * Make any changes you need to make to the database here
 */
exports.up = function up (done) {
  // done() devuelve al Migrator de lib/migrations
  dbReady()

    // Código principal de migración
    .then(() => Tag.find())
    .then((tags) => {
      tags.forEach(tag => {
        Topic.collection.updateMany({'tags': {$in: [tag.name]} }, { $set: { tag: ObjectID(tag.id) }});
      });
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
