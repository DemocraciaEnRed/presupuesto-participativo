const dbReady = require('lib/models').ready

const models = require('lib/models')
const Forum = models.Forum

const nombreMigrationParaLog = 'cargar escuelas'

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
					const copyAttrs = deepCopy(forumProyecto.topicsAttrs)
          copyAttrs.filter(a => a.name == "admin-comment" || a.name == "admin-comment-referencia")
            .forEach(a => {
              a.hide = false
              a.group = 'Cierre'
              a.groupOrder = 1
              a.width = 12
              if (a.name == "admin-comment"){
                a.title = "Comentario del moderador"
                a.description = "Escribir aquí un comentario en el caso que se cambie el estado a \"Factible\" o \"No factible\""
              }else if (a.name == "admin-comment-referencia"){
                a.title = "Integración de ideas"
                a.description = "Colocar aquí el link a la idea final, en el caso que esta idea esté integrada junto con otra"
              }
            })

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
