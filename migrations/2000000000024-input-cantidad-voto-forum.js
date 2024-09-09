const dbReady = require('lib/models').ready

const models = require('lib/models')
const Forum = models.Forum

const nombreMigrationParaLog = 'Se agrega campo cantidad de votos en el admin'

const newFields = [
	{
		"name" : "proyecto-votos",
		"title" : "Cantidad de votos",
		"description" : "Sin comas ni puntos",
		"kind" : "Number",
		"mandatory" : false,
		"groupOrder" : 2,
		"group" : "2. Proyecto",
		"order" : 4,
		"width" : 12,
		"icon" : "",
		"min": 1,
		"max": 1000 * 1000 // 1 billon
	}
]

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

					let copyAttrs = deepCopy(forumProyecto.topicsAttrs)

					copyAttrs.forEach(attr => {
						// Modificaciones manuales
						if (attr.name == 'proyecto-titulo'){
							attr.hide = true
						}
					})

					// insertamos nuevos campos
					copyAttrs.push(...newFields)


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
