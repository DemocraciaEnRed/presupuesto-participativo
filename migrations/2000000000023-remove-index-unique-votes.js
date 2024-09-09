const dbReady = require('lib/models').ready
const models = require('lib/models')

const nombreMigrationParaLog = 'remove index topic_1_author_1 from Votes'
const Vote = models.Vote

/**
 * Make any changes you need to make to the database here
 */
exports.up = function up (done) {
  // done() devuelve al Migrator de lib/migrations
  dbReady()
    .then(() => {
      return new Promise((resolve, reject) => {
        // Encontrame todas las indexes con topic y author = 1
        Vote.collection.getIndexes({ topic: 1, author: 1 })
        .then((indexes) => {
          // Si hay alguna, borrala
          if (indexes.length > 0) {
            // Sip, hay una.. por las dudas si hay mas de una (?) eliminarla.
            Object.keys(indexes).forEach((i) => {
              if (i === "topic_1_author_1") {
                Vote.collection.dropIndex({ topic: 1, author: 1 }, (err) => {
                  if (err) {
                    reject(err)
                  } else {
                    resolve()
                  }
                })
              }
            })
          } else {
            resolve()
          }
        })
        .catch((err) => {
          reject(err)
        })
      })
    })
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
