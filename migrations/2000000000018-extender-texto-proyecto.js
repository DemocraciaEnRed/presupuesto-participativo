const dbReady = require('lib/models').ready

const models = require('lib/models')
const Forum = models.Forum

const nombreMigrationParaLog = 'extender texto proyecto'

const deepCopy = obj => {
	return JSON.parse(JSON.stringify(obj))
}
/**
 * Make any changes you need to make to the database here
 */
class SaltearPromises { }
exports.up = function up (done) {
  dbReady()
		// updatear
    .then(() => {
      return new Promise((resolve, reject) => {
	      Forum.findOne({name: 'proyectos'}, (err, forumProyecto) => {
	        if (err)
            reject(new Error(err))
					if (!forumProyecto || !forumProyecto.topicsAttrs)
            reject(new Error('No forum proyectos or no topicAttrs in it found'))

					// por algún motivo no nos deja editar un item del array
					let copyAttrs = deepCopy(forumProyecto.topicsAttrs)

					const problemaAttr = copyAttrs.find(attr => attr.name == 'problema')
					problemaAttr.description = 'Tenga en cuenta que solo se veran los primeros 400 caracteres en la portada'
					problemaAttr.max = 5000

					// borramos todo y volvemos a generar
					forumProyecto.topicsAttrs.splice(0)
					forumProyecto.topicsAttrs.push(...copyAttrs)

					forumProyecto.markModified('topicsAttrs')

					Forum.collection.save(forumProyecto, (err) => {
						if (err) reject(new Error(err))
						resolve()
					})
        })
      })
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
