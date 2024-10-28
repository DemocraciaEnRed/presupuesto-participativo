const dbReady = require('lib/models').ready

const Forum = require('lib/models').Forum

/**
 * Make any changes you need to make to the database here
 */
class SaltearPromises { }
exports.up = function up (done) {
  dbReady()
  .then(() => {
    return new Promise((resolve, reject) => {
      Forum.findOne({ name: 'proyectos' }, (err, forumProyecto) => {
        if (err) reject(new Error(err))
        if (!forumProyecto) reject(new Error('No forum proyectos in it found'))

        forumProyecto.config = {}
        forumProyecto.config.mostrarFormulariosProyectistas = false
        /* forumProyecto.config.noticeTexto = config.propuestasAbiertas
                                         ? config.propuestasTextoAbiertas
                                         : config.propuestasTextoCerradas */
        //forumProyecto.config.mostrarSeccionEventos = false
        
        forumProyecto.config.propuestasAbiertas = false
        forumProyecto.config.preIdeacion = false
        forumProyecto.config.ideacion = false
        forumProyecto.config.PreVotacion = false
        forumProyecto.config.votacion = false
        forumProyecto.config.seguimientoNormal = true


        forumProyecto.markModified('config')

        Forum.collection.save(forumProyecto, (err) => {
          if (err) reject(new Error(err))
          resolve()
        })
      })
    })
  })
  // Devolvemos al Migrator (de lib/migrations)
  .then(() => {
    console.log(`-- Actualizados valores de extended forum config`)
    done()
  })
  .catch((err) => {
    if (err instanceof SaltearPromises) {
      done()
    } else {
      console.log('-- Actualizacion de valores de extended forum topic attrs no funcionó! Error: ', err)
      done(err)
    }
  })
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
exports.down = function down (done) {
  done()
}