const dbReady = require('lib/models').ready

const models = require('lib/models')
const Forum = models.Forum

const nombreMigrationParaLog = 'Se agrega campo cantidad de historial del presupuesto en el admin y cambio del label de estado compra a en contratacion'

const newFields = [
	{
		"name" : "presupuesto-historial",
		"title" : "Historial de ejecución de presupuesto",
		"description" : "Puede dejar aquí notas acerca de la ejecución del presupuesto",
		"kind" : "LongString",
		"mandatory" : false,
		"groupOrder" : 2,
		"group" : "3. Presupuesto",
		"order" : 6,
		"width" : 12,
		"icon" : "",
		"min": 1,
		"max": 8000 // 1 billon
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
						if (attr.name == 'presupuesto-estado'){
							// find the index of option.name == compra
							let index = attr.options.findIndex(option => option.name == 'compra')
							if (index != -1){
								attr.options[index].title = 'En Contratación'
							}
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
