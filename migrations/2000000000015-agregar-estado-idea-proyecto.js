const dbReady = require('lib/models').ready
const models = require('lib/models')

const nombreMigrationParaLog = 'agregar estado idea proyecto'
const Forum = models.Forum

const deepCopy = obj => {
	return JSON.parse(JSON.stringify(obj))
}

/**
 * Make any changes you need to make to the database here
 */
exports.up = function up (done) {
  // done() devuelve al Migrator de lib/migrations
  dbReady()

    // Código principal de migración
    // .then(() => Forum.findOne({name: 'proyectos'}))
    // .then((forumProyecto) => {
    //   if (!forumProyecto || !forumProyecto.topicsAttrs)
    //     throw new Error('No forum proyectos or no topicAttrs in it found')

		// 	// por algún motivo no nos deja editar un item del array
		// 	const copyAttrs = deepCopy(forumProyecto.topicsAttrs)

		// 	const stateAttr = copyAttrs.find(a => a.name == 'state')

		// 	// borramos campo anterior si ya estaba
		// 	const ideaProyectoIndex = stateAttr.options.findIndex(a => a.name == 'idea-proyecto')
		// 	if (ideaProyectoIndex != -1)
		// 		stateAttr.options.splice(ideaProyectoIndex, 1)

    //   stateAttr.options.push({
    //     name: 'idea-proyecto',
    //     title: 'Idea-Proyecto'
    //   })

    //   // borramos todo y volvemos a generar
    //   forumProyecto.topicsAttrs.splice(0)
    //   forumProyecto.topicsAttrs.push(...copyAttrs)

    //   forumProyecto.markModified('topicsAttrs')

    //   return new Promise((resolve, reject) =>
    //     Forum.collection.save(forumProyecto, (err) => {
    //       if (err) reject(new Error(err))
    //       resolve()
    //     })
    //   )
    // })

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
